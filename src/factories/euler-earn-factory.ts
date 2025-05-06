import { dataSource } from "@graphprotocol/graph-ts"
import { DeployEulerEarn as DeployEulerEarnEvent } from "../../generated/EulerEarnFactory/EulerEarnFactory"
import { DeployEulerEarn, EulerEarnVault } from "../../generated/schema"
import { EulerEarn as EulerEarnTemplate } from "../../generated/templates"

import { loadOrCreateEulerEarnVault } from "../utils/earnVault"
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

  loadOrCreateEulerEarnVault(event.params._eulerEarnVault)
  // Create templates with context
  let context = dataSource.context()
  EulerEarnTemplate.createWithContext(event.params._eulerEarnVault, context)
}
