
import { PoolDeployed as PoolDeployedEvent, PoolUninstalled as PoolUninstalledEvent } from '../../generated/EulerSwapFactory/EulerSwapFactory'
import { EulerSwapPool, EulerSwapPoolUninstalled } from '../../generated/schema'
import { dataSource } from "@graphprotocol/graph-ts"
import { EulerSwap as EulerSwapTemplate } from '../../generated/templates'

export function handlePoolDeployed(event: PoolDeployedEvent): void {

    let entity = new EulerSwapPool(
        event.params.pool
    )
    entity.asset0 = event.params.asset0
    entity.asset1 = event.params.asset1
    entity.vault0 = event.params.vault0
    entity.vault1 = event.params.vault1
    entity.fee = event.params.fee
    entity.eulerAccount = event.params.eulerAccount
    entity.reserve0 = event.params.reserve0
    entity.reserve1 = event.params.reserve1
    entity.priceY = event.params.priceY
    entity.priceX = event.params.priceX
    entity.concentrationX = event.params.concentrationX
    entity.concentrationY = event.params.concentrationY
    entity.pool = event.params.pool
    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash
    entity.active = false
    entity.save()

    let context = dataSource.context()
    EulerSwapTemplate.createWithContext(event.params.pool, context)
}

export function handlePoolUninstalled(event: PoolUninstalledEvent): void {
    let entity = new EulerSwapPoolUninstalled(
        event.params.pool,
    )
    entity.asset0 = event.params.asset0
    entity.asset1 = event.params.asset1
    entity.eulerAccount = event.params.eulerAccount
    entity.pool = event.params.pool
    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash
    entity.save()

    let poolEntity = EulerSwapPool.load(event.params.pool)
    if (poolEntity) {
        poolEntity.active = false
        poolEntity.save()
    }
}