export const IdentityManagementABI = {
  abi: [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [],
      name: "HandlesAlreadySavedForRequestID",
      type: "error",
    },
    {
      inputs: [],
      name: "InvalidKMSSignatures",
      type: "error",
    },
    {
      inputs: [],
      name: "NoHandleFoundForRequestID",
      type: "error",
    },
    {
      inputs: [],
      name: "UnsupportedHandleType",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "oldAdmin",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newAdmin",
          type: "address",
        },
      ],
      name: "AdminTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "requestID",
          type: "uint256",
        },
      ],
      name: "DecryptionFulfilled",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
      ],
      name: "IdentityRegistered",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "requestId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "proofType",
          type: "string",
        },
      ],
      name: "ProofRequested",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "requestId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "proofType",
          type: "string",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "result",
          type: "bool",
        },
      ],
      name: "ProofResult",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "enum IdentityManagement.CountryCode",
          name: "countryCode",
          type: "uint8",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
      ],
      name: "ValidCountryCodeAdded",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "enum IdentityManagement.CountryCode",
          name: "countryCode",
          type: "uint8",
        },
      ],
      name: "addValidCountryCodeExternal",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "admin",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "requestId",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "decryptedInput",
          type: "bool",
        },
        {
          internalType: "bytes[]",
          name: "signatures",
          type: "bytes[]",
        },
      ],
      name: "handleProofResult",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "isDecryptionPending",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "isIdentityRegistered",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "latestRequestId",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "proveAgeOver18",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "proveAgeOver21AndValidCountry",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "externalEuint8",
          name: "encryptedAge",
          type: "bytes32",
        },
        {
          internalType: "bytes",
          name: "ageProof",
          type: "bytes",
        },
        {
          internalType: "externalEbool",
          name: "encryptedIsStudent",
          type: "bytes32",
        },
        {
          internalType: "bytes",
          name: "isStudentProof",
          type: "bytes",
        },
        {
          internalType: "externalEuint256",
          name: "encryptedPassportHash",
          type: "bytes32",
        },
        {
          internalType: "bytes",
          name: "passportHashProof",
          type: "bytes",
        },
        {
          internalType: "externalEuint16",
          name: "encryptedCity",
          type: "bytes32",
        },
        {
          internalType: "bytes",
          name: "cityProof",
          type: "bytes",
        },
        {
          internalType: "externalEuint8",
          name: "encryptedCountryCode",
          type: "bytes32",
        },
        {
          internalType: "bytes",
          name: "countryCodeProof",
          type: "bytes",
        },
      ],
      name: "registerIdentity",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newAdmin",
          type: "address",
        },
      ],
      name: "transferAdmin",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
};
