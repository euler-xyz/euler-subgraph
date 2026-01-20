import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts"
import { TrackingActiveAccount, TrackingVaultBalance } from "../../generated/schema"
import { EulerVault } from "../../generated/templates/EulerVault/EulerVault"

const ADDRESS_PREFIX_LENGTH = 19
const ZERO_ADDRESS = Address.zero()

function getAddressPrefix(account: Bytes): Bytes {
    return Bytes.fromUint8Array(account.slice(0, ADDRESS_PREFIX_LENGTH))
}

function loadTrackingActiveAccount(addressPrefix: Bytes): TrackingActiveAccount {
    let entity = TrackingActiveAccount.load(addressPrefix)
    if (entity == null) {
        entity = new TrackingActiveAccount(addressPrefix)
        entity.addressPrefix = addressPrefix
        entity.borrows = []
        entity.deposits = []
        entity.blockNumber = BigInt.zero()
        entity.blockTimestamp = BigInt.zero()
        entity.transactionHash = Bytes.empty()
        entity.save()
    }
    return entity
}

/**
 * Tracks account activity in any Euler vault.
 * Uses try_debtOf() to handle Earn vaults which don't have debt.
 */
export function trackActions(
    account: Bytes,
    vault: Bytes,
    blockNumber: BigInt,
    blockTimestamp: BigInt,
    transactionHash: Bytes,
): void {
    // Skip zero address (mints/burns)
    if (Address.fromBytes(account).equals(ZERO_ADDRESS)) {
        return
    }
    
    let addressPrefix = getAddressPrefix(account)
    let vaultContract = EulerVault.bind(Address.fromBytes(vault))
    let entity = loadTrackingActiveAccount(addressPrefix)

    // Get balance
    let balance = vaultContract.balanceOf(Address.fromBytes(account))
    
    // Try to get debt
    let debt = BigInt.fromI32(0)
    let debtResult = vaultContract.try_debtOf(Address.fromBytes(account))
    if (!debtResult.reverted) {
        debt = debtResult.value
    }

    let hasDeposits = balance.gt(BigInt.fromI32(0))
    let hasBorrows = debt.gt(BigInt.fromI32(0))
    let trackingId = account.concat(vault)
    
    // Load or create balance entity
    let balanceEntity = TrackingVaultBalance.load(trackingId)
    if (!balanceEntity) {
        balanceEntity = new TrackingVaultBalance(trackingId)
        balanceEntity.balance = BigInt.fromI32(0)
        balanceEntity.debt = BigInt.fromI32(0)
    }

    // Handle deposits list
    if (hasDeposits) {
        if (!entity.deposits.includes(trackingId)) {
            let deposits = entity.deposits
            entity.deposits = deposits.concat([trackingId])
        }
    } else if (balanceEntity.balance.gt(BigInt.fromI32(0))) {
        // Only remove if there was a previous deposit
        if (entity.deposits.includes(trackingId)) {
            let deposits = entity.deposits
            let index = deposits.indexOf(trackingId)
            deposits.splice(index, 1)
            entity.deposits = deposits
        }
    }

    // Handle borrows list
    if (hasBorrows) {
        if (!entity.borrows.includes(trackingId)) {
            let borrows = entity.borrows
            entity.borrows = borrows.concat([trackingId])
        }
    } else if (balanceEntity.debt.gt(BigInt.fromI32(0))) {
        // Only remove if there was previous debt
        if (entity.borrows.includes(trackingId)) {
            let borrows = entity.borrows
            let index = borrows.indexOf(trackingId)
            borrows.splice(index, 1)
            entity.borrows = borrows
        }
    }

    // Update tracking entity
    entity.blockTimestamp = blockTimestamp
    entity.blockNumber = blockNumber
    entity.transactionHash = transactionHash
    entity.save()

    // Update balance entity
    balanceEntity.addressPrefix = addressPrefix
    balanceEntity.account = account
    balanceEntity.balance = balance
    balanceEntity.debt = debt
    balanceEntity.vault = vault
    balanceEntity.blockTimestamp = blockTimestamp
    balanceEntity.blockNumber = blockNumber
    balanceEntity.transactionHash = transactionHash
    balanceEntity.save()
}
