export const termsOfUseSignerAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_evc",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "EVC",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "lastTermsOfUseSignatureTimestamp",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "termsOfUseHash",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "signTermsOfUse",
    inputs: [
      {
        name: "termsOfUseMessage",
        type: "string",
        internalType: "string",
      },
      {
        name: "termsOfUseHash",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "TermsOfUseSigned",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "termsOfUseHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "timestamp",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "message",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "ControllerDisabled",
    inputs: [],
  },
  {
    type: "error",
    name: "EVC_InvalidAddress",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidTermsOfUseHash",
    inputs: [
      {
        name: "actualTermsOfUseHash",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "expectedTermsOfUseHash",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "error",
    name: "NotAuthorized",
    inputs: [],
  },
] as const
