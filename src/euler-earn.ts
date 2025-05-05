import {
  Approval as ApprovalEvent,
  DelegateChanged as DelegateChangedEvent,
  DelegateVotesChanged as DelegateVotesChangedEvent,
  Deposit as DepositEvent,
  Transfer as TransferEvent,
  Withdraw as WithdrawEvent,
} from "../generated/templates/EulerEarn/EulerEarn"
import {
  EulerEarnApproval as Approval,
  EulerEarnDeposit as Deposit,
  EulerEarnTransfer as Transfer,
  EulerEarnWithdraw as Withdraw,
} from "../generated/schema"
import { trackActionsInEarnVaults } from "./utils/tracking"
import { increaseCounter } from "./utils/counter"
import {
  ExecuteHarvest as ExecuteHarvestEvent,
  Harvest as HarvestEvent,
  Rebalance as RebalanceEvent,
  InterestUpdated as InterestUpdatedEvent,
} from "../generated/templates/EulerEarn/EulerEarn"
import {
  EulerEarnVault,
  EulerEarnExecuteHarvest,
  EulerEarnHarvest,
  EulerEarnRebalance,
  EulerEarnInterestUpdated,
} from "../generated/schema"
import { BigInt, BigDecimal, Bytes } from "@graphprotocol/graph-ts"




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


export function handleExecuteHarvest(event: ExecuteHarvestEvent): void {
  let entity = new EulerEarnExecuteHarvest(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  let harvest = EulerEarnHarvest.load(
    event.transaction.hash
  )
  if (!harvest) {
    harvest = new EulerEarnHarvest(event.transaction.hash)
    harvest.timestamp = event.block.timestamp
    harvest.harvester = event.transaction.from
    harvest.txHash = event.transaction.hash
    harvest.eulerEarnVault = event.address
    harvest.totalAllocated = BigInt.zero()
    harvest.totalYield = BigInt.zero()
    harvest.totalLoss = BigInt.zero()
    harvest.blockNumber = event.block.number
    harvest.blockTimestamp = event.block.timestamp
    harvest.transactionHash = event.transaction.hash
    harvest.save()
  }

  entity.timestamp = event.block.timestamp
  entity.eulerEarnVault = event.address
  entity.harvest = harvest.id
  entity.strategy = event.params.strategy
  entity.eulerEarnAssetsAmount = event.params.eulerEarnAssetsAmount
  entity.strategyAllocatedAmount = event.params.strategyAllocatedAmount
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleHarvest(event: HarvestEvent): void {
  let entity = EulerEarnHarvest.load(event.transaction.hash)
  if (!entity) {
    entity = new EulerEarnHarvest(event.transaction.hash)
  }

  entity.timestamp = event.block.timestamp
  entity.harvester = event.transaction.from
  entity.txHash = event.transaction.hash
  entity.eulerEarnVault = event.address
  entity.totalAllocated = event.params.totalAllocated
  entity.totalYield = event.params.totalYield
  entity.totalLoss = event.params.totalLoss
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRebalance(event: RebalanceEvent): void {
  let entity = new EulerEarnRebalance(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.timestamp = event.block.timestamp
  entity.rebalancer = event.transaction.from
  entity.txHash = event.transaction.hash
  entity.eulerEarnVault = event.address
  entity.strategy = event.params.strategy
  entity.amountToRebalance = event.params.amountToRebalance
  entity.isDeposit = event.params.isDeposit
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}


export function handleInterestUpdated(event: InterestUpdatedEvent): void {
  let entity = new EulerEarnInterestUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.timestamp = event.block.timestamp
  entity.eulerEarnVault = event.address
  entity.interestAccrued = event.params.interestAccrued
  entity.interestLeft = event.params.interestLeft
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Update vault's average interest accrued
  let vault = EulerEarnVault.load(event.address)
  // if (vault) {
  //   let since = event.block.timestamp.minus(BigInt.fromI32(7 * 24 * 60 * 60))
  //   let interestUpdatesLoaded = vault.interestUpdated.load()
  //   let interestUpdates: EulerEarnInterestUpdated[] = []

  //   for (let i = 0; i < interestUpdatesLoaded.length; i++) {
  //     if (interestUpdatesLoaded[i].timestamp.gt(since)) {
  //       interestUpdates.push(interestUpdatesLoaded[i])
  //     }
  //   }

  //   let totalInterest = BigDecimal.zero()
  //   for (let i = 0; i < interestUpdates.length; i++) {
  //     totalInterest = totalInterest.plus(
  //       interestUpdates[i].interestAccrued.toBigDecimal()
  //     )
  //   }

  //   vault.averageInterestAccruedLast7Days = totalInterest.div(
  //     BigDecimal.fromString(interestUpdates.length.toString())
  //   )

  //   // Update APY
  //   if (vault.totalAssets.gt(BigInt.zero())) {
  //     vault.apy = vault.averageInterestAccruedLast7Days.div(
  //       vault.totalAssets.toBigDecimal()
  //     )
  //   }

  //   vault.save()
  // }
}
