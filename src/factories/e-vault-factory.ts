import { dataSource } from "@graphprotocol/graph-ts"
import {
  Genesis as GenesisEvent,
  ProxyCreated as ProxyCreatedEvent,
  SetImplementation as SetImplementationEvent,
  SetUpgradeAdmin as SetUpgradeAdminEvent,
} from "../../generated/EVaultFactory/EVaultFactory"
import {
  ProxyCreated,
} from "../../generated/schema"
import { EVault as EVaultTemplate } from "../../generated/templates"
 

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
  let context = dataSource.context()
  EVaultTemplate.createWithContext(event.params.proxy,context)
}
 
