export const feeFlowControllerAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "evc",
        type: "address",
        internalType: "address",
      },
      {
        name: "initPrice",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "paymentToken_",
        type: "address",
        internalType: "address",
      },
      {
        name: "paymentReceiver_",
        type: "address",
        internalType: "address",
      },
      {
        name: "epochPeriod_",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "priceMultiplier_",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "minInitPrice_",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "ABS_MAX_INIT_PRICE",
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
    type: "function",
    name: "ABS_MIN_INIT_PRICE",
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
    name: "MAX_EPOCH_PERIOD",
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
    type: "function",
    name: "MAX_PRICE_MULTIPLIER",
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
    type: "function",
    name: "MIN_EPOCH_PERIOD",
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
    type: "function",
    name: "MIN_PRICE_MULTIPLIER",
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
    type: "function",
    name: "PRICE_MULTIPLIER_SCALE",
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
    type: "function",
    name: "buy",
    inputs: [
      {
        name: "assets",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "assetsReceiver",
        type: "address",
        internalType: "address",
      },
      {
        name: "epochId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "maxPaymentTokenAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "paymentAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "epochPeriod",
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
    type: "function",
    name: "getPrice",
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
    type: "function",
    name: "getSlot0",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct FeeFlowController.Slot0",
        components: [
          {
            name: "locked",
            type: "uint8",
            internalType: "uint8",
          },
          {
            name: "epochId",
            type: "uint16",
            internalType: "uint16",
          },
          {
            name: "initPrice",
            type: "uint192",
            internalType: "uint192",
          },
          {
            name: "startTime",
            type: "uint40",
            internalType: "uint40",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "minInitPrice",
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
    type: "function",
    name: "paymentReceiver",
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
    name: "paymentToken",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract ERC20",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "priceMultiplier",
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
    name: "Buy",
    inputs: [
      {
        name: "buyer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "assetsReceiver",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "paymentAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
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
    name: "DeadlinePassed",
    inputs: [],
  },
  {
    type: "error",
    name: "EVC_InvalidAddress",
    inputs: [],
  },
  {
    type: "error",
    name: "EmptyAssets",
    inputs: [],
  },
  {
    type: "error",
    name: "EpochIdMismatch",
    inputs: [],
  },
  {
    type: "error",
    name: "EpochPeriodBelowMin",
    inputs: [],
  },
  {
    type: "error",
    name: "EpochPeriodExceedsMax",
    inputs: [],
  },
  {
    type: "error",
    name: "InitPriceBelowMin",
    inputs: [],
  },
  {
    type: "error",
    name: "InitPriceExceedsMax",
    inputs: [],
  },
  {
    type: "error",
    name: "MaxPaymentTokenAmountExceeded",
    inputs: [],
  },
  {
    type: "error",
    name: "MinInitPriceBelowMin",
    inputs: [],
  },
  {
    type: "error",
    name: "MinInitPriceExceedsAbsMaxInitPrice",
    inputs: [],
  },
  {
    type: "error",
    name: "NotAuthorized",
    inputs: [],
  },
  {
    type: "error",
    name: "PaymentReceiverIsThis",
    inputs: [],
  },
  {
    type: "error",
    name: "PriceMultiplierBelowMin",
    inputs: [],
  },
  {
    type: "error",
    name: "PriceMultiplierExceedsMax",
    inputs: [],
  },
  {
    type: "error",
    name: "Reentrancy",
    inputs: [],
  },
] as const
