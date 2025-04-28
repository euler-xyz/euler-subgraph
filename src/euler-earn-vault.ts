import {
  ExecuteHarvest as ExecuteHarvestEvent,
  Harvest as HarvestEvent,
  Rebalance as RebalanceEvent,
  InterestUpdated as InterestUpdatedEvent,
} from "../generated/templates/EulerEarn/EulerEarn"
import {
  EulerEarnVault,
  EulerEarnVault_ExecuteHarvest,
  EulerEarnVault_Harvest,
  EulerEarnVault_Rebalance,
  EulerEarnVault_InterestUpdated,
} from "../generated/schema"
import { BigInt, BigDecimal, Bytes } from "@graphprotocol/graph-ts"

export function handleExecuteHarvest(event: ExecuteHarvestEvent): void {
  let entity = new EulerEarnVault_ExecuteHarvest(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  
  let harvest = EulerEarnVault_Harvest.load(
    event.transaction.hash
  )
  if (!harvest) {
    harvest = new EulerEarnVault_Harvest(event.transaction.hash)
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
  let entity = EulerEarnVault_Harvest.load(event.transaction.hash)
  if (!entity) {
    entity = new EulerEarnVault_Harvest(event.transaction.hash)
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
  let entity = new EulerEarnVault_Rebalance(
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
  let entity = new EulerEarnVault_InterestUpdated(
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
  if (vault) {
    let since = event.block.timestamp.minus(BigInt.fromI32(7 * 24 * 60 * 60))
    let interestUpdatesLoaded = vault.interestUpdated.load()
    let interestUpdates = interestUpdatesLoaded.filter(
      (update: EulerEarnVault_InterestUpdated) => update.timestamp.ge(since)
    )

    let totalInterest = BigDecimal.zero()
    for (let i = 0; i < interestUpdates.length; i++) {
      totalInterest = totalInterest.plus(
        interestUpdates[i].interestAccrued.toBigDecimal()
      )
    }

    vault.averageInterestAccruedLast7Days = totalInterest.div(
      BigDecimal.fromString(interestUpdates.length.toString())
    )

    // Update APY
    if (vault.totalAssets.gt(BigInt.zero())) {
      vault.apy = vault.averageInterestAccruedLast7Days.div(
        vault.totalAssets.toBigDecimal()
      )
    }

    vault.save()
  }
} 
