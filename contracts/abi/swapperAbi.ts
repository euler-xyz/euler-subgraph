export const swapperAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "uniswapRouterV2",
        type: "address",
        internalType: "address",
      },
      {
        name: "uniswapRouterV3",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "HANDLER_GENERIC",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "HANDLER_UNISWAP_V2",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "HANDLER_UNISWAP_V3",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "deposit",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "vault",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountMin",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "multicall",
    inputs: [
      {
        name: "calls",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "repay",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "vault",
        type: "address",
        internalType: "address",
      },
      {
        name: "repayAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "repayAndDeposit",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "vault",
        type: "address",
        internalType: "address",
      },
      {
        name: "repayAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "swap",
    inputs: [
      {
        name: "params",
        type: "tuple",
        internalType: "struct ISwapper.SwapParams",
        components: [
          {
            name: "handler",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "mode",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "account",
            type: "address",
            internalType: "address",
          },
          {
            name: "tokenIn",
            type: "address",
            internalType: "address",
          },
          {
            name: "tokenOut",
            type: "address",
            internalType: "address",
          },
          {
            name: "vaultIn",
            type: "address",
            internalType: "address",
          },
          {
            name: "accountIn",
            type: "address",
            internalType: "address",
          },
          {
            name: "receiver",
            type: "address",
            internalType: "address",
          },
          {
            name: "amountOut",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "data",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "sweep",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountMin",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "uniswapRouterV2",
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
    name: "uniswapRouterV3",
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
    type: "error",
    name: "E_EmptyError",
    inputs: [],
  },
  {
    type: "error",
    name: "Swapper_Reentrancy",
    inputs: [],
  },
  {
    type: "error",
    name: "Swapper_SwapError",
    inputs: [
      {
        name: "swapProvider",
        type: "address",
        internalType: "address",
      },
      {
        name: "rawError",
        type: "bytes",
        internalType: "bytes",
      },
    ],
  },
  {
    type: "error",
    name: "Swapper_TargetDebt",
    inputs: [],
  },
  {
    type: "error",
    name: "Swapper_UnknownHandler",
    inputs: [],
  },
  {
    type: "error",
    name: "Swapper_UnknownMode",
    inputs: [],
  },
  {
    type: "error",
    name: "Swapper_UnsupportedMode",
    inputs: [],
  },
  {
    type: "error",
    name: "UniswapV2Handler_InvalidPath",
    inputs: [],
  },
  {
    type: "error",
    name: "UniswapV3Handler_InvalidPath",
    inputs: [],
  },
] as const
