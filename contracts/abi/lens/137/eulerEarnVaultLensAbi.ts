export const eulerEarnVaultLensAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_oracleLens",
        type: "address",
        internalType: "address",
      },
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
    name: "getVaultAccessControlInfo",
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
        internalType: "struct EulerEarnVaultAccessControlInfo",
        components: [
          {
            name: "defaultAdmins",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "guardianAdmins",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "strategyOperatorAdmins",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "eulerEarnManagerAdmins",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "withdrawalQueueManagerAdmins",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "rebalancerAdmins",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "guardians",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "strategyOperators",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "eulerEarnManagers",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "withdrawalQueueManagers",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "rebalancers",
            type: "address[]",
            internalType: "address[]",
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
            name: "totalAssetsDeposited",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalAssetsAllocated",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalAssetsAllocatable",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalAllocationPoints",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "interestAccrued",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "lastInterestUpdate",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "interestSmearEnd",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "interestLeft",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "lastHarvestTimestamp",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "interestSmearingPeriod",
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
            name: "hookedOperations",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "hookTarget",
            type: "address",
            internalType: "address",
          },
          {
            name: "evc",
            type: "address",
            internalType: "address",
          },
          {
            name: "balanceTracker",
            type: "address",
            internalType: "address",
          },
          {
            name: "permit2",
            type: "address",
            internalType: "address",
          },
          {
            name: "isHarvestCoolDownCheckOn",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "accessControlInfo",
            type: "tuple",
            internalType: "struct EulerEarnVaultAccessControlInfo",
            components: [
              {
                name: "defaultAdmins",
                type: "address[]",
                internalType: "address[]",
              },
              {
                name: "guardianAdmins",
                type: "address[]",
                internalType: "address[]",
              },
              {
                name: "strategyOperatorAdmins",
                type: "address[]",
                internalType: "address[]",
              },
              {
                name: "eulerEarnManagerAdmins",
                type: "address[]",
                internalType: "address[]",
              },
              {
                name: "withdrawalQueueManagerAdmins",
                type: "address[]",
                internalType: "address[]",
              },
              {
                name: "rebalancerAdmins",
                type: "address[]",
                internalType: "address[]",
              },
              {
                name: "guardians",
                type: "address[]",
                internalType: "address[]",
              },
              {
                name: "strategyOperators",
                type: "address[]",
                internalType: "address[]",
              },
              {
                name: "eulerEarnManagers",
                type: "address[]",
                internalType: "address[]",
              },
              {
                name: "withdrawalQueueManagers",
                type: "address[]",
                internalType: "address[]",
              },
              {
                name: "rebalancers",
                type: "address[]",
                internalType: "address[]",
              },
            ],
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
                name: "assetsAllocated",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "allocationPoints",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "allocationCap",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "isInEmergency",
                type: "bool",
                internalType: "bool",
              },
            ],
          },
          {
            name: "backupAssetPriceInfo",
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
          {
            name: "backupAssetOracleInfo",
            type: "tuple",
            internalType: "struct OracleDetailedInfo",
            components: [
              {
                name: "oracle",
                type: "address",
                internalType: "address",
              },
              {
                name: "name",
                type: "string",
                internalType: "string",
              },
              {
                name: "oracleInfo",
                type: "bytes",
                internalType: "bytes",
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
