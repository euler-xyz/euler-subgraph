export const swapVerifierAbi = [
  {
    type: "function",
    name: "verifyAmountMinAndSkim",
    inputs: [
      {
        name: "vault",
        type: "address",
        internalType: "address",
      },
      {
        name: "receiver",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountMin",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "verifyDebtMax",
    inputs: [
      {
        name: "vault",
        type: "address",
        internalType: "address",
      },
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountMax",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "view",
  },
  {
    type: "error",
    name: "SwapVerifier_debtMax",
    inputs: [],
  },
  {
    type: "error",
    name: "SwapVerifier_pastDeadline",
    inputs: [],
  },
  {
    type: "error",
    name: "SwapVerifier_skimMin",
    inputs: [],
  },
] as const
