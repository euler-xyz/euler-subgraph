export const ethereumVaultConnectorAbi = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "receive",
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "areChecksDeferred",
    inputs: [],
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
    name: "areChecksInProgress",
    inputs: [],
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
    name: "batch",
    inputs: [
      {
        name: "items",
        type: "tuple[]",
        internalType: "struct IEVC.BatchItem[]",
        components: [
          {
            name: "targetContract",
            type: "address",
            internalType: "address",
          },
          {
            name: "onBehalfOfAccount",
            type: "address",
            internalType: "address",
          },
          {
            name: "value",
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
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "batchRevert",
    inputs: [
      {
        name: "items",
        type: "tuple[]",
        internalType: "struct IEVC.BatchItem[]",
        components: [
          {
            name: "targetContract",
            type: "address",
            internalType: "address",
          },
          {
            name: "onBehalfOfAccount",
            type: "address",
            internalType: "address",
          },
          {
            name: "value",
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
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "batchSimulation",
    inputs: [
      {
        name: "items",
        type: "tuple[]",
        internalType: "struct IEVC.BatchItem[]",
        components: [
          {
            name: "targetContract",
            type: "address",
            internalType: "address",
          },
          {
            name: "onBehalfOfAccount",
            type: "address",
            internalType: "address",
          },
          {
            name: "value",
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
    outputs: [
      {
        name: "batchItemsResult",
        type: "tuple[]",
        internalType: "struct IEVC.BatchItemResult[]",
        components: [
          {
            name: "success",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "result",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "accountsStatusCheckResult",
        type: "tuple[]",
        internalType: "struct IEVC.StatusCheckResult[]",
        components: [
          {
            name: "checkedAddress",
            type: "address",
            internalType: "address",
          },
          {
            name: "isValid",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "result",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "vaultsStatusCheckResult",
        type: "tuple[]",
        internalType: "struct IEVC.StatusCheckResult[]",
        components: [
          {
            name: "checkedAddress",
            type: "address",
            internalType: "address",
          },
          {
            name: "isValid",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "result",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "call",
    inputs: [
      {
        name: "targetContract",
        type: "address",
        internalType: "address",
      },
      {
        name: "onBehalfOfAccount",
        type: "address",
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "result",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "controlCollateral",
    inputs: [
      {
        name: "targetCollateral",
        type: "address",
        internalType: "address",
      },
      {
        name: "onBehalfOfAccount",
        type: "address",
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "result",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "disableCollateral",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "vault",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "disableController",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "enableCollateral",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "vault",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "enableController",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "vault",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "forgiveAccountStatusCheck",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "forgiveVaultStatusCheck",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "getAccountOwner",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
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
    name: "getAddressPrefix",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes19",
        internalType: "bytes19",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "getCollaterals",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
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
    name: "getControllers",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
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
    name: "getCurrentOnBehalfOfAccount",
    inputs: [
      {
        name: "controllerToCheck",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "onBehalfOfAccount",
        type: "address",
        internalType: "address",
      },
      {
        name: "controllerEnabled",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLastAccountStatusCheckTimestamp",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
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
    name: "getNonce",
    inputs: [
      {
        name: "addressPrefix",
        type: "bytes19",
        internalType: "bytes19",
      },
      {
        name: "nonceNamespace",
        type: "uint256",
        internalType: "uint256",
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
    name: "getOperator",
    inputs: [
      {
        name: "addressPrefix",
        type: "bytes19",
        internalType: "bytes19",
      },
      {
        name: "operator",
        type: "address",
        internalType: "address",
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
    name: "getRawExecutionContext",
    inputs: [],
    outputs: [
      {
        name: "context",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "haveCommonOwner",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "otherAccount",
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
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "isAccountOperatorAuthorized",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "operator",
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
    name: "isAccountStatusCheckDeferred",
    inputs: [
      {
        name: "account",
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
    name: "isCollateralEnabled",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
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
    name: "isControlCollateralInProgress",
    inputs: [],
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
    name: "isControllerEnabled",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
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
    name: "isLockdownMode",
    inputs: [
      {
        name: "addressPrefix",
        type: "bytes19",
        internalType: "bytes19",
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
    name: "isOperatorAuthenticated",
    inputs: [],
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
    name: "isPermitDisabledMode",
    inputs: [
      {
        name: "addressPrefix",
        type: "bytes19",
        internalType: "bytes19",
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
    name: "isSimulationInProgress",
    inputs: [],
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
    name: "isVaultStatusCheckDeferred",
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
    name: "permit",
    inputs: [
      {
        name: "signer",
        type: "address",
        internalType: "address",
      },
      {
        name: "sender",
        type: "address",
        internalType: "address",
      },
      {
        name: "nonceNamespace",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "nonce",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "signature",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "reorderCollaterals",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "index1",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "index2",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "requireAccountAndVaultStatusCheck",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "requireAccountStatusCheck",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "requireVaultStatusCheck",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "setAccountOperator",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "operator",
        type: "address",
        internalType: "address",
      },
      {
        name: "authorized",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "setLockdownMode",
    inputs: [
      {
        name: "addressPrefix",
        type: "bytes19",
        internalType: "bytes19",
      },
      {
        name: "enabled",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "setNonce",
    inputs: [
      {
        name: "addressPrefix",
        type: "bytes19",
        internalType: "bytes19",
      },
      {
        name: "nonceNamespace",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "nonce",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "setOperator",
    inputs: [
      {
        name: "addressPrefix",
        type: "bytes19",
        internalType: "bytes19",
      },
      {
        name: "operator",
        type: "address",
        internalType: "address",
      },
      {
        name: "operatorBitField",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "setPermitDisabledMode",
    inputs: [
      {
        name: "addressPrefix",
        type: "bytes19",
        internalType: "bytes19",
      },
      {
        name: "enabled",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "event",
    name: "AccountStatusCheck",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "controller",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CallWithContext",
    inputs: [
      {
        name: "caller",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "onBehalfOfAddressPrefix",
        type: "bytes19",
        indexed: true,
        internalType: "bytes19",
      },
      {
        name: "onBehalfOfAccount",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "targetContract",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "selector",
        type: "bytes4",
        indexed: false,
        internalType: "bytes4",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CollateralStatus",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "collateral",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "enabled",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ControllerStatus",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "controller",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "enabled",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "LockdownModeStatus",
    inputs: [
      {
        name: "addressPrefix",
        type: "bytes19",
        indexed: true,
        internalType: "bytes19",
      },
      {
        name: "enabled",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "NonceStatus",
    inputs: [
      {
        name: "addressPrefix",
        type: "bytes19",
        indexed: true,
        internalType: "bytes19",
      },
      {
        name: "nonceNamespace",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "oldNonce",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "newNonce",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "NonceUsed",
    inputs: [
      {
        name: "addressPrefix",
        type: "bytes19",
        indexed: true,
        internalType: "bytes19",
      },
      {
        name: "nonceNamespace",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "nonce",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OperatorStatus",
    inputs: [
      {
        name: "addressPrefix",
        type: "bytes19",
        indexed: true,
        internalType: "bytes19",
      },
      {
        name: "operator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "accountOperatorAuthorized",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnerRegistered",
    inputs: [
      {
        name: "addressPrefix",
        type: "bytes19",
        indexed: true,
        internalType: "bytes19",
      },
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PermitDisabledModeStatus",
    inputs: [
      {
        name: "addressPrefix",
        type: "bytes19",
        indexed: true,
        internalType: "bytes19",
      },
      {
        name: "enabled",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "VaultStatusCheck",
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
    name: "EVC_BatchPanic",
    inputs: [],
  },
  {
    type: "error",
    name: "EVC_ChecksReentrancy",
    inputs: [],
  },
  {
    type: "error",
    name: "EVC_ControlCollateralReentrancy",
    inputs: [],
  },
  {
    type: "error",
    name: "EVC_ControllerViolation",
    inputs: [],
  },
  {
    type: "error",
    name: "EVC_EmptyError",
    inputs: [],
  },
  {
    type: "error",
    name: "EVC_InvalidAddress",
    inputs: [],
  },
  {
    type: "error",
    name: "EVC_InvalidData",
    inputs: [],
  },
  {
    type: "error",
    name: "EVC_InvalidNonce",
    inputs: [],
  },
  {
    type: "error",
    name: "EVC_InvalidOperatorStatus",
    inputs: [],
  },
  {
    type: "error",
    name: "EVC_InvalidTimestamp",
    inputs: [],
  },
  {
    type: "error",
    name: "EVC_InvalidValue",
    inputs: [],
  },
  {
    type: "error",
    name: "EVC_LockdownMode",
    inputs: [],
  },
  {
    type: "error",
    name: "EVC_NotAuthorized",
    inputs: [],
  },
  {
    type: "error",
    name: "EVC_OnBehalfOfAccountNotAuthenticated",
    inputs: [],
  },
  {
    type: "error",
    name: "EVC_PermitDisabledMode",
    inputs: [],
  },
  {
    type: "error",
    name: "EVC_RevertedBatchResult",
    inputs: [
      {
        name: "batchItemsResult",
        type: "tuple[]",
        internalType: "struct IEVC.BatchItemResult[]",
        components: [
          {
            name: "success",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "result",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "accountsStatusResult",
        type: "tuple[]",
        internalType: "struct IEVC.StatusCheckResult[]",
        components: [
          {
            name: "checkedAddress",
            type: "address",
            internalType: "address",
          },
          {
            name: "isValid",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "result",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "vaultsStatusResult",
        type: "tuple[]",
        internalType: "struct IEVC.StatusCheckResult[]",
        components: [
          {
            name: "checkedAddress",
            type: "address",
            internalType: "address",
          },
          {
            name: "isValid",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "result",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
  },
  {
    type: "error",
    name: "EVC_SimulationBatchNested",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidIndex",
    inputs: [],
  },
  {
    type: "error",
    name: "TooManyElements",
    inputs: [],
  },
] as const
