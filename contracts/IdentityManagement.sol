// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

// Import Fully Homomorphic Encryption (FHE) library for encrypted data types and operations
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

// Smart contract for managing decentralized, encrypted identities
contract IdentityManagement is SepoliaConfig {
    // Address of the contract administrator
    address public admin;

    // Enum defining supported country codes
    enum CountryCode {
        US,
        CA,
        EU
    }

    // Struct to store encrypted user identity information
    struct Identity {
        euint8 age; // Encrypted user age
        ebool isStudent; // Encrypted student status
        euint256 passportHash; // Encrypted passport hash
        euint16 city; // Encrypted city code
        euint8 countryCode; // Encrypted country code
        bool isRegistered; // Registration status (true if registered)
    }

    // Mapping to store user identities by their address
    mapping(address => Identity) private identities;

    // Array of valid encrypted country codes
    euint8[] private validCountryCodes;

    // Mapping from CountryCode enum to its encrypted euint8 representation
    mapping(CountryCode => euint8) private countryCodeToEncrypted;

    // Mapping to check if a country code is valid
    mapping(euint8 => bool) private isValidCountryCode;

    // Events for logging contract actions
    // Emitted when a user registers their identity
    event IdentityRegistered(address indexed user, uint256 timestamp);
    // Emitted when a proof is requested
    event ProofRequested(address indexed user, uint256 requestId, string proofType);
    // Emitted when a new country code is added
    event ValidCountryCodeAdded(CountryCode countryCode, uint256 timestamp);
    // Emitted when admin role is transferred
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);

    // Constructor: Initializes the contract
    constructor() {
        admin = msg.sender; // Set deployer as the admin
        // Initialize valid country codes (US, CA, EU)
        addValidCountryCode(CountryCode.US);
        addValidCountryCode(CountryCode.CA);
        addValidCountryCode(CountryCode.EU);
    }

    // Modifier: Restricts function access to the admin only
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    // Internal function to add a valid country code
    function addValidCountryCode(CountryCode countryCode) internal {
        uint8 countryCodeValue = uint8(countryCode); // Convert enum to uint8
        euint8 encryptedCountryCode = FHE.asEuint8(countryCodeValue); // Encrypt the country code
        validCountryCodes.push(encryptedCountryCode); // Add to valid country codes array
        isValidCountryCode[encryptedCountryCode] = true; // Mark as valid
        countryCodeToEncrypted[countryCode] = encryptedCountryCode; // Map enum to encrypted value
        FHE.allowThis(encryptedCountryCode); // Allow contract to use the encrypted value
        emit ValidCountryCodeAdded(countryCode, block.timestamp); // Emit event
    }

    // Function to register a user's encrypted identity
    function registerIdentity(
        externalEuint8 encryptedAge, // Encrypted age
        bytes calldata ageProof, // Proof for age decryption
        externalEbool encryptedIsStudent, // Encrypted student status
        bytes calldata isStudentProof, // Proof for student status decryption
        externalEuint256 encryptedPassportHash, // Encrypted passport hash
        bytes calldata passportHashProof, // Proof for passport hash decryption
        externalEuint16 encryptedCity, // Encrypted city code
        bytes calldata cityProof, // Proof for city code decryption
        externalEuint8 encryptedCountryCode, // Encrypted country code
        bytes calldata countryCodeProof // Proof for country code decryption
    ) external {
        require(!identities[msg.sender].isRegistered, "Identity already registered");

        // Init object
        Identity storage identity = identities[msg.sender];

        // convert and store
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

        emit IdentityRegistered(msg.sender, block.timestamp); // Emit event
    }

    // Function to prove if the user's age is over 18
    function proveAgeOver18() external returns (uint256) {
        require(identities[msg.sender].isRegistered, "Identity not registered"); // Ensure user is registered

        // Check if encrypted age is greater than 18
        ebool isOver18 = FHE.gt(identities[msg.sender].age, FHE.asEuint8(18));

        // Request decryption of the boolean result
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(isOver18);
        uint256 requestId = FHE.requestDecryption(cts, this.handleProofResult.selector);

        emit ProofRequested(msg.sender, requestId, "AgeOver18"); // Emit event
        return requestId; // Return the decryption request ID
    }

    // Function to prove if the user is over 21 and has a valid country code
    function proveAgeOver21AndValidCountry() external returns (uint256) {
        require(identities[msg.sender].isRegistered, "Identity not registered"); // Ensure user is registered

        // Check if encrypted age is greater than 21
        ebool isOver21 = FHE.gt(identities[msg.sender].age, FHE.asEuint8(21));

        // Check if the country code is valid
        ebool isValidCountry = isValidCountryCode[identities[msg.sender].countryCode]
            ? FHE.asEbool(true)
            : FHE.asEbool(false);

        // Combine conditions: age > 21 AND valid country code
        ebool result = FHE.and(isOver21, isValidCountry);

        // Request decryption of the boolean result
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(result);
        uint256 requestId = FHE.requestDecryption(cts, this.handleProofResult.selector);

        emit ProofRequested(msg.sender, requestId, "AgeOver21AndValidCountry"); // Emit event
        return requestId; // Return the decryption request ID
    }

    // Callback function to handle decryption results
    function handleProofResult(uint256 requestId, bytes[] memory signatures) external {
        FHE.checkSignatures(requestId, signatures); // Verify signatures for decryption
    }

    // Utility function to check if a user is registered
    function isIdentityRegistered(address user) external view returns (bool) {
        return identities[user].isRegistered; // Return registration status
    }

    // Function for admin to add a new valid country code
    function addValidCountryCodeExternal(CountryCode countryCode) external onlyAdmin {
        addValidCountryCode(countryCode); // Call internal function to add country code
    }

    // Function to transfer admin role to a new address
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address"); // Ensure new admin address is valid
        address oldAdmin = admin;
        admin = newAdmin; // Update admin
        emit AdminTransferred(oldAdmin, newAdmin); // Emit event
    }
}
