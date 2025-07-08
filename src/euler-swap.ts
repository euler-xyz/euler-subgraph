import { EulerSwapActivated as EulerSwapActivatedEvent, Swap as EulerSwapEvent } from '../generated/templates/EulerSwap/EulerSwap'
import { EulerSwap, EulerSwapActivated, EulerSwapPool } from '../generated/schema'
export function handleEulerSwapActivated(event: EulerSwapActivatedEvent): void {
    let entity = new EulerSwapActivated(event.transaction.hash.concatI32(event.logIndex.toI32()))
    entity.asset0 = event.params.asset0
    entity.asset1 = event.params.asset1
    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash
    entity.save()

    let poolEntity = EulerSwapPool.load(event.address)
    if (poolEntity) {
        poolEntity.active = true
        poolEntity.save()
    }
}

export function handleEulerSwap(event: EulerSwapEvent): void {
    let entity = new EulerSwap(event.transaction.hash.concatI32(event.logIndex.toI32()))
    entity.amount0In = event.params.amount0In
    entity.amount1In = event.params.amount1In
    entity.amount0Out = event.params.amount0Out
    entity.amount1Out = event.params.amount1Out
    entity.reserve0 = event.params.reserve0
    entity.reserve1 = event.params.reserve1
    entity.from = event.params.sender
    entity.to = event.params.to
    entity.pool = event.address
    entity.sender = event.transaction.from
    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash
    entity.save()
}