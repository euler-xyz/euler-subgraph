export const utilsLensAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_oracleLens",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "TTL_ERROR",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "int256",
        internalType: "int256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "TTL_INFINITY",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "int256",
        internalType: "int256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "TTL_LIQUIDATION",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "int256",
        internalType: "int256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "TTL_MORE_THAN_ONE_YEAR",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "int256",
        internalType: "int256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "calculateTimeToLiquidation",
    inputs: [
      {
        name: "liabilityVault",
        type: "address",
        internalType: "address",
      },
      {
        name: "liabilityValue",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "collaterals",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "collateralValues",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    outputs: [
      {
        name: "",
        type: "int256",
        internalType: "int256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "computeAPYs",
    inputs: [
      {
        name: "borrowSPY",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "cash",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "borrows",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "interestFee",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "borrowAPY",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "supplyAPY",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "getAssetPriceInfo",
    inputs: [
      {
        name: "asset",
        type: "address",
        internalType: "address",
      },
      {
        name: "unitOfAccount",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct AssetPriceInfo",
        components: [
          {
            name: "queryFailure",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "queryFailureReason",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "timestamp",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "oracle",
            type: "address",
            internalType: "address",
          },
          {
            name: "asset",
            type: "address",
            internalType: "address",
          },
          {
            name: "unitOfAccount",
            type: "address",
            internalType: "address",
          },
          {
            name: "amountIn",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "amountOutMid",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "amountOutBid",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "amountOutAsk",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getControllerAssetPriceInfo",
    inputs: [
      {
        name: "controller",
        type: "address",
        internalType: "address",
      },
      {
        name: "asset",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct AssetPriceInfo",
        components: [
          {
            name: "queryFailure",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "queryFailureReason",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "timestamp",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "oracle",
            type: "address",
            internalType: "address",
          },
          {
            name: "asset",
            type: "address",
            internalType: "address",
          },
          {
            name: "unitOfAccount",
            type: "address",
            internalType: "address",
          },
          {
            name: "amountIn",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "amountOutMid",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "amountOutBid",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "amountOutAsk",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "oracleLens",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract OracleLens",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenAllowances",
    inputs: [
      {
        name: "spender",
        type: "address",
        internalType: "address",
      },
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokens",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenBalances",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokens",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "view",
  },
] as const
