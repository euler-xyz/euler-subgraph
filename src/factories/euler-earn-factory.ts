import { dataSource } from "@graphprotocol/graph-ts"
import { DeployEulerEarn as DeployEulerEarnEvent } from "../../generated/EulerEarnFactory/EulerEarnFactory"
import { DeployEulerEarn, EulerEarnVault } from "../../generated/schema"
import { EulerEarn as EulerEarnTemplate } from "../../generated/templates"
import { BigInt, BigDecimal } from "@graphprotocol/graph-ts"

export function handleDeployEulerEarn(event: DeployEulerEarnEvent): void {
  // Create DeployEulerEarn entity
  let deployEntity = new DeployEulerEarn(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  deployEntity._owner = event.params._owner
  deployEntity._eulerEarnVault = event.params._eulerEarnVault
  deployEntity._asset = event.params._asset

  deployEntity.blockNumber = event.block.number
  deployEntity.blockTimestamp = event.block.timestamp
  deployEntity.transactionHash = event.transaction.hash

  deployEntity.save()

  // Create EulerEarnVault entity
  let vaultEntity = new EulerEarnVault(event.params._eulerEarnVault)
  vaultEntity.owner = event.params._owner
  vaultEntity.asset = event.params._asset
  vaultEntity.createdAt = event.block.timestamp
  vaultEntity.totalAssets = BigInt.zero()
  vaultEntity.apy = BigDecimal.zero()
  vaultEntity.averageInterestAccruedLast7Days = BigDecimal.zero()
  vaultEntity.save()

  // Create templates with context
  let context = dataSource.context()
  EulerEarnTemplate.createWithContext(event.params._eulerEarnVault, context)
}
