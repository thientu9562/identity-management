// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {
    FHE,
    euint8,
    euint16,
    euint256,
    ebool,
    externalEuint8,
    externalEuint16,
    externalEuint256,
    externalEbool
} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract IdentityManagement is SepoliaConfig {
    address public admin;

    enum CountryCode {
        US,
        CA,
        EU
    }

    struct Identity {
        euint8 age;
        ebool isStudent;
        euint256 passportHash;
        euint16 city;
        euint8 countryCode;
        bool isRegistered;
    }

    mapping(address => Identity) private identities;
    euint8[] private validCountryCodes;
    mapping(CountryCode => euint8) private countryCodeToEncrypted;
    mapping(euint8 => bool) private isValidCountryCode;

    // Mappings to store decryption request information
    mapping(uint256 => bytes32) private requestCiphertexts;
    mapping(uint256 => string) private requestTypes;
    mapping(uint256 => address) private requestUsers;
    // Variables to track pending decryption requests
    bool public isDecryptionPending;
    uint256 public latestRequestId;

    event IdentityRegistered(address indexed user, uint256 timestamp);
    event ProofRequested(address indexed user, uint256 requestId, string proofType);
    event ProofResult(address indexed user, uint256 requestId, string proofType, bool result);
    event ValidCountryCodeAdded(CountryCode countryCode, uint256 timestamp);
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);

    constructor() {
        admin = msg.sender;
        addValidCountryCode(CountryCode.US);
        addValidCountryCode(CountryCode.CA);
        addValidCountryCode(CountryCode.EU);
        isDecryptionPending = false;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    function addValidCountryCode(CountryCode countryCode) internal {
        uint8 countryCodeValue = uint8(countryCode);
        euint8 encryptedCountryCode = FHE.asEuint8(countryCodeValue);
        validCountryCodes.push(encryptedCountryCode);
        isValidCountryCode[encryptedCountryCode] = true;
        countryCodeToEncrypted[countryCode] = encryptedCountryCode;
        FHE.allowThis(encryptedCountryCode);
        emit ValidCountryCodeAdded(countryCode, block.timestamp);
    }

    function registerIdentity(
        externalEuint8 encryptedAge,
        bytes calldata ageProof,
        externalEbool encryptedIsStudent,
        bytes calldata isStudentProof,
        externalEuint256 encryptedPassportHash,
        bytes calldata passportHashProof,
        externalEuint16 encryptedCity,
        bytes calldata cityProof,
        externalEuint8 encryptedCountryCode,
        bytes calldata countryCodeProof
    ) external {
        require(!identities[msg.sender].isRegistered, "Identity already registered");

        Identity storage identity = identities[msg.sender];

        identity.age = FHE.fromExternal(encryptedAge, ageProof);
        FHE.allowThis(identity.age);

        identity.isStudent = FHE.fromExternal(encryptedIsStudent, isStudentProof);
        FHE.allowThis(identity.isStudent);

        identity.passportHash = FHE.fromExternal(encryptedPassportHash, passportHashProof);
        FHE.allowThis(identity.passportHash);

        identity.city = FHE.fromExternal(encryptedCity, cityProof);
        FHE.allowThis(identity.city);

        identity.countryCode = FHE.fromExternal(encryptedCountryCode, countryCodeProof);
        FHE.allowThis(identity.countryCode);

        identity.isRegistered = true;

        emit IdentityRegistered(msg.sender, block.timestamp);
    }

    function proveAgeOver18() external returns (uint256) {
        require(identities[msg.sender].isRegistered, "Identity not registered");
        require(!isDecryptionPending, "Decryption is in progress");

        // Compare encrypted age with 18
        ebool isOver18 = FHE.gt(identities[msg.sender].age, FHE.asEuint8(18));
        ebool isValidCountry = isValidCountryCode[identities[msg.sender].countryCode]
            ? FHE.asEbool(true)
            : FHE.asEbool(false);
        ebool result = FHE.and(isOver18, isValidCountry);

        // Store ciphertext and request decryption
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(result);
        latestRequestId = FHE.requestDecryption(cts, this.handleProofResult.selector);
        isDecryptionPending = true;

        // Store request info for later processing
        requestCiphertexts[latestRequestId] = cts[0];
        requestTypes[latestRequestId] = "AgeOver18";
        requestUsers[latestRequestId] = msg.sender;

        emit ProofRequested(msg.sender, latestRequestId, "AgeOver18");
        return latestRequestId;
    }

    function proveAgeOver21AndValidCountry() external returns (uint256) {
        require(identities[msg.sender].isRegistered, "Identity not registered");
        require(!isDecryptionPending, "Decryption is in progress");

        ebool isOver21 = FHE.gt(identities[msg.sender].age, FHE.asEuint8(21));
        ebool isValidCountry = isValidCountryCode[identities[msg.sender].countryCode]
            ? FHE.asEbool(true)
            : FHE.asEbool(false);
        ebool result = FHE.and(isOver21, isValidCountry);

        // Store ciphertext and request decryption
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(result);
        latestRequestId = FHE.requestDecryption(cts, this.handleProofResult.selector);
        isDecryptionPending = true;

        requestCiphertexts[latestRequestId] = cts[0];
        requestTypes[latestRequestId] = "AgeOver21AndValidCountry";
        requestUsers[latestRequestId] = msg.sender;

        emit ProofRequested(msg.sender, latestRequestId, "AgeOver21AndValidCountry");
        return latestRequestId;
    }

    // Callback to receive decrypted result from Oracle
    function handleProofResult(uint256 requestId, bool decryptedInput, bytes[] memory signatures) external {
        // Verify the requestId matches the latest request
        require(requestId == latestRequestId, "Invalid requestId");
        FHE.checkSignatures(requestId, signatures);

        // Retrieve request info
        address user = requestUsers[requestId];
        string memory proofType = requestTypes[requestId];

        // Clean up storage
        delete requestCiphertexts[requestId];
        delete requestTypes[requestId];
        delete requestUsers[requestId];
        isDecryptionPending = false;

        // Emit result (true if eligible, false otherwise)
        emit ProofResult(user, requestId, proofType, decryptedInput);
    }

    function isIdentityRegistered(address user) external view returns (bool) {
        return identities[user].isRegistered;
    }

    function addValidCountryCodeExternal(CountryCode countryCode) external onlyAdmin {
        addValidCountryCode(countryCode);
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        address oldAdmin = admin;
        admin = newAdmin;
        emit AdminTransferred(oldAdmin, newAdmin);
    }
}
