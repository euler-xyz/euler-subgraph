import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { EulerSwapPool } from "../../generated/schema"



export function loadOrCreateEulerSwapPool(address: Bytes): EulerSwapPool {
    let pool = EulerSwapPool.load(address)
    if (!pool) {
        pool = new EulerSwapPool(address)
        pool.active = false
        pool.asset0 = Bytes.fromHexString("0x")
        pool.asset1 = Bytes.fromHexString("0x")
        pool.eulerAccount = Bytes.fromHexString("0x")
        pool.pool = address
        pool.fee = BigInt.fromI32(0)
        pool.blockNumber = BigInt.fromI32(0)
        pool.blockTimestamp = BigInt.fromI32(0)
        pool.transactionHash = Bytes.fromHexString("0x")
        pool.save()
    }
    return pool
}