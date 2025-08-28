export const eulerEarnVaultLensAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_utilsLens",
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
    name: "getStrategiesInfo",
    inputs: [
      {
        name: "vault",
        type: "address",
        internalType: "address",
      },
      {
        name: "strategies",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct EulerEarnVaultStrategyInfo[]",
        components: [
          {
            name: "strategy",
            type: "address",
            internalType: "address",
          },
          {
            name: "allocatedAssets",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "availableAssets",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "currentAllocationCap",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "pendingAllocationCap",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "pendingAllocationCapValidAt",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "removableAt",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "info",
            type: "tuple",
            internalType: "struct VaultInfoERC4626",
            components: [
              {
                name: "timestamp",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "vault",
                type: "address",
                internalType: "address",
              },
              {
                name: "vaultName",
                type: "string",
                internalType: "string",
              },
              {
                name: "vaultSymbol",
                type: "string",
                internalType: "string",
              },
              {
                name: "vaultDecimals",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "asset",
                type: "address",
                internalType: "address",
              },
              {
                name: "assetName",
                type: "string",
                internalType: "string",
              },
              {
                name: "assetSymbol",
                type: "string",
                internalType: "string",
              },
              {
                name: "assetDecimals",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "totalShares",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "totalAssets",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "isEVault",
                type: "bool",
                internalType: "bool",
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getStrategyInfo",
    inputs: [
      {
        name: "_vault",
        type: "address",
        internalType: "address",
      },
      {
        name: "_strategy",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct EulerEarnVaultStrategyInfo",
        components: [
          {
            name: "strategy",
            type: "address",
            internalType: "address",
          },
          {
            name: "allocatedAssets",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "availableAssets",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "currentAllocationCap",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "pendingAllocationCap",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "pendingAllocationCapValidAt",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "removableAt",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "info",
            type: "tuple",
            internalType: "struct VaultInfoERC4626",
            components: [
              {
                name: "timestamp",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "vault",
                type: "address",
                internalType: "address",
              },
              {
                name: "vaultName",
                type: "string",
                internalType: "string",
              },
              {
                name: "vaultSymbol",
                type: "string",
                internalType: "string",
              },
              {
                name: "vaultDecimals",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "asset",
                type: "address",
                internalType: "address",
              },
              {
                name: "assetName",
                type: "string",
                internalType: "string",
              },
              {
                name: "assetSymbol",
                type: "string",
                internalType: "string",
              },
              {
                name: "assetDecimals",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "totalShares",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "totalAssets",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "isEVault",
                type: "bool",
                internalType: "bool",
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getVaultInfoFull",
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
        type: "tuple",
        internalType: "struct EulerEarnVaultInfoFull",
        components: [
          {
            name: "timestamp",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "vault",
            type: "address",
            internalType: "address",
          },
          {
            name: "vaultName",
            type: "string",
            internalType: "string",
          },
          {
            name: "vaultSymbol",
            type: "string",
            internalType: "string",
          },
          {
            name: "vaultDecimals",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "asset",
            type: "address",
            internalType: "address",
          },
          {
            name: "assetName",
            type: "string",
            internalType: "string",
          },
          {
            name: "assetSymbol",
            type: "string",
            internalType: "string",
          },
          {
            name: "assetDecimals",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalShares",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalAssets",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "lostAssets",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "availableAssets",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "timelock",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "performanceFee",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "feeReceiver",
            type: "address",
            internalType: "address",
          },
          {
            name: "owner",
            type: "address",
            internalType: "address",
          },
          {
            name: "creator",
            type: "address",
            internalType: "address",
          },
          {
            name: "curator",
            type: "address",
            internalType: "address",
          },
          {
            name: "guardian",
            type: "address",
            internalType: "address",
          },
          {
            name: "evc",
            type: "address",
            internalType: "address",
          },
          {
            name: "permit2",
            type: "address",
            internalType: "address",
          },
          {
            name: "pendingTimelock",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "pendingTimelockValidAt",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "pendingGuardian",
            type: "address",
            internalType: "address",
          },
          {
            name: "pendingGuardianValidAt",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "supplyQueue",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "strategies",
            type: "tuple[]",
            internalType: "struct EulerEarnVaultStrategyInfo[]",
            components: [
              {
                name: "strategy",
                type: "address",
                internalType: "address",
              },
              {
                name: "allocatedAssets",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "availableAssets",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "currentAllocationCap",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "pendingAllocationCap",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "pendingAllocationCapValidAt",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "removableAt",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "info",
                type: "tuple",
                internalType: "struct VaultInfoERC4626",
                components: [
                  {
                    name: "timestamp",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "vault",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "vaultName",
                    type: "string",
                    internalType: "string",
                  },
                  {
                    name: "vaultSymbol",
                    type: "string",
                    internalType: "string",
                  },
                  {
                    name: "vaultDecimals",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "asset",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "assetName",
                    type: "string",
                    internalType: "string",
                  },
                  {
                    name: "assetSymbol",
                    type: "string",
                    internalType: "string",
                  },
                  {
                    name: "assetDecimals",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "totalShares",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "totalAssets",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "isEVault",
                    type: "bool",
                    internalType: "bool",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "utilsLens",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract UtilsLens",
      },
    ],
    stateMutability: "view",
  },
] as const
