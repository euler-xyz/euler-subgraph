import {
  Approval as ApprovalEvent,
  Deposit as DepositEvent,
  Transfer as TransferEvent,
  Withdraw as WithdrawEvent,
  AccrueInterest as AccrueInterestEvent,
  OwnershipTransferStarted as OwnershipTransferStartedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  RevokePendingCap as RevokePendingCapEvent,
  RevokePendingGuardian as RevokePendingGuardianEvent,
  RevokePendingMarketRemoval as RevokePendingMarketRemovalEvent,
  RevokePendingTimelock as RevokePendingTimelockEvent,
  SetCap as SetCapEvent,
  SetCurator as SetCuratorEvent,
  SetFee as SetFeeEvent,
  SetFeeRecipient as SetFeeRecipientEvent,
  SetGuardian as SetGuardianEvent,
  SetIsAllocator as SetIsAllocatorEvent,
  SetName as SetNameEvent,
  SetSupplyQueue as SetSupplyQueueEvent,
  SetSymbol as SetSymbolEvent,
  SetTimelock as SetTimelockEvent,
  SetWithdrawQueue as SetWithdrawQueueEvent,
  SubmitCap as SubmitCapEvent,
  SubmitGuardian as SubmitGuardianEvent,
  SubmitMarketRemoval as SubmitMarketRemovalEvent,
  SubmitTimelock as SubmitTimelockEvent,
  ReallocateSupply as ReallocateSupplyEvent,
  ReallocateWithdraw as ReallocateWithdrawEvent,
  UpdateLastTotalAssets as UpdateLastTotalAssetsEvent,
  UpdateLostAssets as UpdateLostAssetsEvent
} from "../generated/templates/EulerEarn/EulerEarn"
import { Bytes } from "@graphprotocol/graph-ts"
import {
  EulerEarnApproval as Approval,
  EulerEarnDeposit as Deposit,
  EulerEarnTransfer as Transfer,
  EulerEarnWithdraw as Withdraw,
  EulerEarnAccrueInterest,
  EulerEarnOwnershipTransferStarted,
  EulerEarnOwnershipTransferred,
  EulerEarnRevokePendingCap,
  EulerEarnRevokePendingGuardian,
  EulerEarnRevokePendingMarketRemoval,
  EulerEarnRevokePendingTimelock,
  EulerEarnSetCap,
  EulerEarnSetCurator,
  EulerEarnSetFee,
  EulerEarnSetFeeRecipient,
  EulerEarnSetGuardian,
  EulerEarnSetIsAllocator,
  EulerEarnSetName,
  EulerEarnSetSupplyQueue,
  EulerEarnSetSymbol,
  EulerEarnSetTimelock,
  EulerEarnSetWithdrawQueue,
  EulerEarnSubmitCap,
  EulerEarnSubmitGuardian,
  EulerEarnSubmitMarketRemoval,
  EulerEarnSubmitTimelock,
  EulerEarnReallocateSupply,
  EulerEarnReallocateWithdraw,
  EulerEarnUpdateLastTotalAssets,
  EulerEarnUpdateLostAssets,
} from "../generated/schema"
import { trackActionsInEarnVaults } from "./utils/tracking"
import { increaseCounter } from "./utils/counter"
import { updateEulerEarnVault, updateEulerEarnVaultStats } from "./utils/earnVault"

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.owner = event.params.owner
  entity.spender = event.params.spender
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()


  increaseCounter(
    "EarnVaultApproval",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

export function handleDeposit(event: DepositEvent): void {
  let entity = new Deposit(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.sender = event.params.sender
  entity.owner = event.params.owner
  entity.assets = event.params.assets
  entity.shares = event.params.shares
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultDeposit",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  trackActionsInEarnVaults(
    event.params.sender,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  if (event.params.sender !== event.params.owner) {
    // Status from the owner
    trackActionsInEarnVaults(
      event.params.owner,
      event.address,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
    )
  }
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultTransfer",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  trackActionsInEarnVaults(
    event.params.from,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  // We check the end account
  trackActionsInEarnVaults(
    event.params.to,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

export function handleWithdraw(event: WithdrawEvent): void {
  let entity = new Withdraw(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.sender = event.params.sender
  entity.receiver = event.params.receiver
  entity.owner = event.params.owner
  entity.assets = event.params.assets
  entity.shares = event.params.shares
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultWithdraw",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  trackActionsInEarnVaults(
    event.params.sender,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  // If it's a self-transfer, we only track the status from the sender
  if (event.params.sender !== event.params.receiver) {
    trackActionsInEarnVaults(
      event.params.receiver,
      event.address,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
    )
  }

  // If it's a self-transfer, we only track the status from the sender
  if (event.params.sender !== event.params.owner) {
    trackActionsInEarnVaults(
      event.params.owner,
      event.address,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
    )
  }
}

export function handleReallocateSupply(event: ReallocateSupplyEvent): void {
  let entity = new EulerEarnReallocateSupply(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caller = event.params.caller
  entity.market = event.params.id
  entity.suppliedAssets = event.params.suppliedAssets
  entity.suppliedShares = event.params.suppliedShares
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultReallocateSupply",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

export function handleReallocateWithdraw(event: ReallocateWithdrawEvent): void {
  let entity = new EulerEarnReallocateWithdraw(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caller = event.params.caller
  entity.market = event.params.id
  entity.vault = event.address
  entity.withdrawnAssets = event.params.withdrawnAssets
  entity.withdrawnShares = event.params.withdrawnShares
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultReallocateWithdraw",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

export function handleUpdateLastTotalAssets(event: UpdateLastTotalAssetsEvent): void {
  let entity = new EulerEarnUpdateLastTotalAssets(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.updatedTotalAssets = event.params.updatedTotalAssets
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultUpdateLastTotalAssets",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
  updateEulerEarnVaultStats(event.address)
}

export function handleUpdateLostAssets(event: UpdateLostAssetsEvent): void {
  let entity = new EulerEarnUpdateLostAssets(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newLostAssets = event.params.newLostAssets
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultUpdateLostAssets",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
  updateEulerEarnVaultStats(event.address)
}

export function handleAccrueInterest(event: AccrueInterestEvent): void {
  let entity = new EulerEarnAccrueInterest(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newTotalAssets = event.params.newTotalAssets
  entity.feeShares = event.params.feeShares
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultAccrueInterest",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

export function handleOwnershipTransferStarted(event: OwnershipTransferStartedEvent): void {
  let entity = new EulerEarnOwnershipTransferStarted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultOwnershipTransferStarted",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
  updateEulerEarnVault(event.address)
}

export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {
  let entity = new EulerEarnOwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultOwnershipTransferred",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
  updateEulerEarnVault(event.address)
}

export function handleRevokePendingCap(event: RevokePendingCapEvent): void {
  let entity = new EulerEarnRevokePendingCap(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caller = event.params.caller
  entity.market = event.params.id
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultRevokePendingCap",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

export function handleRevokePendingGuardian(event: RevokePendingGuardianEvent): void {
  let entity = new EulerEarnRevokePendingGuardian(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caller = event.params.caller
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultRevokePendingGuardian",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

export function handleRevokePendingMarketRemoval(event: RevokePendingMarketRemovalEvent): void {
  let entity = new EulerEarnRevokePendingMarketRemoval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caller = event.params.caller
  entity.market = event.params.id
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultRevokePendingMarketRemoval",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

export function handleRevokePendingTimelock(event: RevokePendingTimelockEvent): void {
  let entity = new EulerEarnRevokePendingTimelock(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caller = event.params.caller
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultRevokePendingTimelock",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

export function handleSetCap(event: SetCapEvent): void {
  let entity = new EulerEarnSetCap(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caller = event.params.caller
  entity.market = event.params.id
  entity.cap = event.params.cap
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultSetCap",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
  updateEulerEarnVault(event.address)
}

export function handleSetCurator(event: SetCuratorEvent): void {
  let entity = new EulerEarnSetCurator(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newCurator = event.params.newCurator
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultSetCurator",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
  updateEulerEarnVault(event.address)
}

export function handleSetFee(event: SetFeeEvent): void {
  let entity = new EulerEarnSetFee(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caller = event.params.caller
  entity.fee = event.params.newFee
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultSetFee",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
  updateEulerEarnVault(event.address)
}

export function handleSetFeeRecipient(event: SetFeeRecipientEvent): void {
  let entity = new EulerEarnSetFeeRecipient(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newFeeRecipient = event.params.newFeeRecipient
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultSetFeeRecipient",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
  updateEulerEarnVault(event.address)

}

export function handleSetGuardian(event: SetGuardianEvent): void {
  let entity = new EulerEarnSetGuardian(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caller = event.params.caller
  entity.guardian = event.params.guardian
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultSetGuardian",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
  updateEulerEarnVault(event.address)
}

export function handleSetIsAllocator(event: SetIsAllocatorEvent): void {
  let entity = new EulerEarnSetIsAllocator(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.allocator = event.params.allocator
  entity.isAllocator = event.params.isAllocator
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultSetIsAllocator",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

export function handleSetName(event: SetNameEvent): void {
  let entity = new EulerEarnSetName(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.name = event.params.name
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultSetName",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
  updateEulerEarnVault(event.address)
}

export function handleSetSupplyQueue(event: SetSupplyQueueEvent): void {
  let entity = new EulerEarnSetSupplyQueue(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caller = event.params.caller
  // Convert Address array to Bytes array
  let supplyQueueBytes: Array<Bytes> = []
  for (let i = 0; i < event.params.newSupplyQueue.length; i++) {
    supplyQueueBytes.push(event.params.newSupplyQueue[i])
  }
  entity.supplyQueue = supplyQueueBytes
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultSetSupplyQueue",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
  updateEulerEarnVault(event.address)
  updateEulerEarnVaultStats(event.address)
}

export function handleSetSymbol(event: SetSymbolEvent): void {
  let entity = new EulerEarnSetSymbol(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.symbol = event.params.symbol
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultSetSymbol",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

export function handleSetTimelock(event: SetTimelockEvent): void {
  let entity = new EulerEarnSetTimelock(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caller = event.params.caller
  entity.timelock = event.params.newTimelock
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultSetTimelock",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
  updateEulerEarnVault(event.address)
}

export function handleSetWithdrawQueue(event: SetWithdrawQueueEvent): void {
  let entity = new EulerEarnSetWithdrawQueue(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caller = event.params.caller
  // Convert Address array to Bytes array
  let withdrawQueueBytes: Array<Bytes> = []
  for (let i = 0; i < event.params.newWithdrawQueue.length; i++) {
    withdrawQueueBytes.push(event.params.newWithdrawQueue[i])
  }
  entity.withdrawQueue = withdrawQueueBytes
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultSetWithdrawQueue",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
  updateEulerEarnVault(event.address)
  updateEulerEarnVaultStats(event.address)
}

export function handleSubmitCap(event: SubmitCapEvent): void {
  let entity = new EulerEarnSubmitCap(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caller = event.params.caller
  entity.market = event.params.id
  entity.cap = event.params.cap
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultSubmitCap",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

export function handleSubmitGuardian(event: SubmitGuardianEvent): void {
  let entity = new EulerEarnSubmitGuardian(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newGuardian = event.params.newGuardian
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultSubmitGuardian",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

export function handleSubmitMarketRemoval(event: SubmitMarketRemovalEvent): void {
  let entity = new EulerEarnSubmitMarketRemoval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caller = event.params.caller
  entity.market = event.params.id
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultSubmitMarketRemoval",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
  updateEulerEarnVault(event.address)
}

export function handleSubmitTimelock(event: SubmitTimelockEvent): void {
  let entity = new EulerEarnSubmitTimelock(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.timelock = event.params.newTimelock
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultSubmitTimelock",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
  updateEulerEarnVault(event.address)
}

