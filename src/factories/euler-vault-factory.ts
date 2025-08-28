import { Address, dataSource } from "@graphprotocol/graph-ts"
import {
  ProxyCreated as ProxyCreatedEvent,
} from "../../generated/EVaultFactory/EVaultFactory"
import {
  ProxyCreated,
} from "../../generated/schema"
import { EulerVault as EulerVaultTemplate } from "../../generated/templates"
import { updatePerspective } from "../utils/perspectives"

export function handleProxyCreated(event: ProxyCreatedEvent): void {
  let entity = new ProxyCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.proxy = event.params.proxy
  entity.upgradeable = event.params.upgradeable
  entity.implementation = event.params.implementation
  entity.trailingData = event.params.trailingData

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // We update the perspective
  let context = dataSource.context()
  // Update all perspectives

  updatePerspective(Address.fromString(context.getString('edgeFactoryPerspective')), "edgeFactoryPerspective", event.block.number, event.block.timestamp, event.transaction.hash)
  updatePerspective(Address.fromString(context.getString('escrowedCollateralPerspective')), "escrowedCollateralPerspective", event.block.number, event.block.timestamp, event.transaction.hash)
  updatePerspective(Address.fromString(context.getString('eulerEarnFactoryPerspective')), "eulerEarnFactoryPerspective", event.block.number, event.block.timestamp, event.transaction.hash)
  updatePerspective(Address.fromString(context.getString('eulerEarnGovernedPerspective')), "eulerEarnGovernedPerspective", event.block.number, event.block.timestamp, event.transaction.hash)
  updatePerspective(Address.fromString(context.getString('eulerUngoverned0xPerspective')), "eulerUngoverned0xPerspective", event.block.number, event.block.timestamp, event.transaction.hash)
  updatePerspective(Address.fromString(context.getString('eulerUngovernedNzxPerspective')), "eulerUngovernedNzxPerspective", event.block.number, event.block.timestamp, event.transaction.hash)
  updatePerspective(Address.fromString(context.getString('evkFactoryPerspective')), "evkFactoryPerspective", event.block.number, event.block.timestamp, event.transaction.hash)
  updatePerspective(Address.fromString(context.getString('governedPerspective')), "governedPerspective", event.block.number, event.block.timestamp, event.transaction.hash)

  EulerVaultTemplate.createWithContext(event.params.proxy, context)
}

