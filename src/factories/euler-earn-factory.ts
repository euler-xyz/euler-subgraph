import { dataSource } from "@graphprotocol/graph-ts"
import { DeployEulerEarn as DeployEulerEarnEvent } from "../../generated/EulerEarnFactory/EulerEarnFactory"
import { DeployEulerEarn } from "../../generated/schema"
import { EulerEarn as EulerEarnTemplate } from "../../generated/templates"
export function handleDeployEulerEarn(event: DeployEulerEarnEvent): void {
  let entity = new DeployEulerEarn(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity._owner = event.params._owner
  entity._eulerEarnVault = event.params._eulerEarnVault
  entity._asset = event.params._asset

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  let context = dataSource.context()
  EulerEarnTemplate.createWithContext(event.params._eulerEarnVault, context)
}
