import {
  Genesis as GenesisEvent,
  ProxyCreated as ProxyCreatedEvent,
  SetImplementation as SetImplementationEvent,
  SetUpgradeAdmin as SetUpgradeAdminEvent,
} from "../generated/GenericFactory/GenericFactory";
import {
  Genesis,
  ProxyCreated,
  SetImplementation,
  SetUpgradeAdmin,
} from "../generated/schema";
import { EVault as EVaultTemplate } from "../generated/templates";

export function handleGenesis(event: GenesisEvent): void {
  const entity = new Genesis(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleProxyCreated(event: ProxyCreatedEvent): void {
  const entity = new ProxyCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.proxy = event.params.proxy;
  entity.upgradeable = event.params.upgradeable;
  entity.implementation = event.params.implementation;
  entity.trailingData = event.params.trailingData;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  EVaultTemplate.create(event.params.proxy);
}

export function handleSetImplementation(event: SetImplementationEvent): void {
  const entity = new SetImplementation(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.newImplementation = event.params.newImplementation;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleSetUpgradeAdmin(event: SetUpgradeAdminEvent): void {
  const entity = new SetUpgradeAdmin(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.newUpgradeAdmin = event.params.newUpgradeAdmin;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
