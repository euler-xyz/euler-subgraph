import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Counter } from "../../generated/schema"

function loadCounter(id: string, isGlobal: boolean): Counter {
  let entity = Counter.load(Bytes.fromUTF8(id))
  if (entity == null) {
    entity = new Counter(Bytes.fromUTF8(id))
    entity.value = BigInt.zero()
    entity.isGlobal = isGlobal
    entity.type = id
    entity.save()
  }
  return entity
}

export function increaseCounter(
  type: string,
  blockNumber: BigInt,
  blockTimestamp: BigInt,
  transactionHash: Bytes,
): void {
  let global = loadCounter("global", true)
  let entity = loadCounter(type, false)

  // Set the type
  global.type = type
  entity.type = type
  // Increase one the counter
  global.value = global.value.plus(BigInt.fromI32(1))
  entity.value = entity.value.plus(BigInt.fromI32(1))
  // Update information from the last TX
  global.blockNumber = blockNumber
  entity.blockNumber = blockNumber
  global.blockTimestamp = blockTimestamp
  entity.blockTimestamp = blockTimestamp
  global.transactionHash = transactionHash
  entity.transactionHash = transactionHash

  // Save the entity
  global.save()
  entity.save()
}
