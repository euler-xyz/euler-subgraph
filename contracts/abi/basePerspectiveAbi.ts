export const basePerspectiveAbi = [
  {
    type: "function",
    name: "isVerified",
    inputs: [
      {
        name: "vault",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "perspectiveVerify",
    inputs: [
      {
        name: "vault",
        type: "address",
        internalType: "address",
      },
      {
        name: "failEarly",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "vaultFactory",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract GenericFactory",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "verifiedArray",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "verifiedLength",
    inputs: [],
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
    type: "event",
    name: "PerspectiveVerified",
    inputs: [
      {
        name: "vault",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "PerspectiveError",
    inputs: [
      {
        name: "perspective",
        type: "address",
        internalType: "address",
      },
      {
        name: "vault",
        type: "address",
        internalType: "address",
      },
      {
        name: "codes",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "PerspectivePanic",
    inputs: [],
  },
] as const
