import { PoolDeployed as PoolDeployedEvent, PoolUninstalled as PoolUninstalledEvent, PoolConfig as PoolConfigEvent } from '../../generated/EulerSwapFactory/EulerSwapFactory'
import { EulerSwapPoolUninstalled } from '../../generated/schema'
import { dataSource } from "@graphprotocol/graph-ts"
import { EulerSwap as EulerSwapTemplate } from '../../generated/templates'
import { loadOrCreateEulerSwapPool } from '../utils/eulerSwap'

export function handlePoolDeployed(event: PoolDeployedEvent): void {

    let entity = loadOrCreateEulerSwapPool(event.params.pool)
    entity.asset0 = event.params.asset0
    entity.asset1 = event.params.asset1
    entity.eulerAccount = event.params.eulerAccount
    entity.pool = event.params.pool
    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash
    entity.active = false
    entity.save()

    let context = dataSource.context()
    EulerSwapTemplate.createWithContext(event.params.pool, context)

}


export function handlePoolConfig(event: PoolConfigEvent): void {

    let poolEntity = loadOrCreateEulerSwapPool(event.params.pool)

    poolEntity.vault0 = event.params.params.vault0
    poolEntity.vault1 = event.params.params.vault1
    poolEntity.fee = event.params.params.fee
    poolEntity.equilibriumReserve0 = event.params.params.equilibriumReserve0
    poolEntity.equilibriumReserve1 = event.params.params.equilibriumReserve1
    poolEntity.currReserve0 = event.params.initialState.currReserve0
    poolEntity.currReserve1 = event.params.initialState.currReserve1
    poolEntity.priceY = event.params.params.priceY
    poolEntity.priceX = event.params.params.priceX
    poolEntity.concentrationX = event.params.params.concentrationX
    poolEntity.concentrationY = event.params.params.concentrationY
    poolEntity.protocolFee = event.params.params.protocolFee
    poolEntity.protocolFeeRecipient = event.params.params.protocolFeeRecipient
    poolEntity.save()

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

    let poolEntity = loadOrCreateEulerSwapPool(event.params.pool)
    poolEntity.active = false
    poolEntity.save()

}