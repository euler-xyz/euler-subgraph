import { dataSource } from "@graphprotocol/graph-ts"
import { CreateEulerEarn as CreateEulerEarnEvent } from "../../generated/EulerEarnFactory/EulerEarnFactory"
import { DeployEulerEarn, EulerEarnVault } from "../../generated/schema"
import { EulerEarn as EulerEarnTemplate } from "../../generated/templates"

import { loadOrCreateEulerEarnVault } from "../utils/earnVault"
export function handleCreateEulerEarn(event: CreateEulerEarnEvent): void {
  // Create DeployEulerEarn entity
  let deployEntity = new DeployEulerEarn(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  deployEntity.owner = event.params.caller
  deployEntity.eulerEarnVault = event.params.eulerEarn
  deployEntity.asset = event.params.asset

  deployEntity.blockNumber = event.block.number
  deployEntity.blockTimestamp = event.block.timestamp
  deployEntity.transactionHash = event.transaction.hash

  deployEntity.save()

  let earnVault = loadOrCreateEulerEarnVault(event.params.eulerEarn)
  earnVault.owner = event.params.caller
  earnVault.save()

  // Create templates with context
  let context = dataSource.context()
  EulerEarnTemplate.createWithContext(event.params.eulerEarn, context)
}
