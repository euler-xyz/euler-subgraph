import { BigInt, Bytes, Address, dataSource } from "@graphprotocol/graph-ts"
import { Account, TrackingActiveAccount, TrackingVaultBalance } from "../../generated/schema"
import { EulerVault } from "../../generated/templates/EulerVault/EulerVault"; // Make sure this path is correct
import { EthereumVaultConnector } from "../../generated/templates/EulerVault/EthereumVaultConnector";
import { EulerEarn } from "../../generated/templates/EulerEarn/EulerEarn";

const zeroAddress = Bytes.fromHexString("0x0000000000000000000000000000000000000000")

function loadTrackingActiveAccounts(mainAddress: Bytes): TrackingActiveAccount {
    let entity = TrackingActiveAccount.load(mainAddress)
    if (entity == null) {
        entity = new TrackingActiveAccount(mainAddress)
        entity.mainAddress = mainAddress
        entity.borrows = []
        entity.deposits = []
        entity.blockNumber = BigInt.zero()
        entity.blockTimestamp = BigInt.zero()
        entity.transactionHash = Bytes.empty()
        entity.save()
    }
    return entity
}

function loadEVaultConnector(): Address {
    let context = dataSource.context()
    return Address.fromString(context.getString('evcAddress'))
}

function loadSubAccount(userAccount: Bytes, evcAddress: Address): Account {
    let accountEntity = Account.load(userAccount)
    if (!accountEntity) {
        accountEntity = new Account(userAccount)
        const evcContract = EthereumVaultConnector.bind(evcAddress)
        let mainAddress = Address.fromBytes(userAccount);
        const mainAddressResult = evcContract.try_getAccountOwner(Address.fromBytes(userAccount))
        if (!mainAddressResult.reverted && mainAddressResult.value.notEqual(zeroAddress)) {
            mainAddress = mainAddressResult.value
        }
        accountEntity.subAccount = userAccount
        accountEntity.owner = mainAddress
        // we save to not ask anymore for this account
        accountEntity.save()

    }
    return accountEntity
}
////////////////////////////////////////////////////////////
// TRACKING ACTIONS IN EVaults
////////////////////////////////////////////////////////////

export function trackActionsInEVaults(
    account: Bytes,
    vault: Bytes,
    blockNumber: BigInt,
    blockTimestamp: BigInt,
    transactionHash: Bytes,
): void {
    const evcContractAddress = loadEVaultConnector()
    const accountEntity = loadSubAccount(account, evcContractAddress)
    updateActiveAccountsInEVaults(accountEntity.owner, account, vault, evcContractAddress, blockNumber, blockTimestamp, transactionHash)
}

export function updateActiveAccountsInEVaults(
    mainAddress: Bytes,
    account: Bytes,
    vault: Bytes,
    evc: Bytes,
    blockNumber: BigInt,
    blockTimestamp: BigInt,
    transactionHash: Bytes,
): void {
    // Don't track if the main address is the zero address
    if (mainAddress.equals(zeroAddress)) return

    let vaultContract = EulerVault.bind(Address.fromBytes(vault))
    let evcContract = EthereumVaultConnector.bind(Address.fromBytes(evc))
    let entity = loadTrackingActiveAccounts(mainAddress)

    // Load the vault contract and check balance and debt
    let balance = vaultContract.balanceOf(Address.fromBytes(account))
    let debt = vaultContract.debtOf(Address.fromBytes(account))
    let isControllerEnabled = evcContract.isControllerEnabled(Address.fromBytes(account), Address.fromBytes(vault))

    let hasDeposits = balance.gt(BigInt.fromI32(0))
    let hasBorrows = debt.gt(BigInt.fromI32(0))
    let trackingId = account.concat(vault)
    // Tracking balances on vaults 
    let balanceEntity = TrackingVaultBalance.load(trackingId)
    if (!balanceEntity) {
        balanceEntity = new TrackingVaultBalance(account.concat(vault))
        balanceEntity.isControllerEnabled = false
        balanceEntity.balance = BigInt.fromI32(0)
        balanceEntity.debt = BigInt.fromI32(0)
    }

    // Handle main accounts list based on liquidity
    if (hasDeposits) {
        // ONLY FOR READABILITY
        if (entity.deposits.includes(trackingId) === false) {
            let accountsWithDeposits = entity.deposits
            entity.deposits = accountsWithDeposits.concat([trackingId])
        }
        // we only remove if there is a previous deposit
    } else if (balanceEntity.balance.gt(BigInt.fromI32(0))) {
        let accountIndex = entity.deposits.indexOf(trackingId)
        if (entity.deposits.includes(trackingId) === true) {
            let accountsWithDeposits = entity.deposits
            accountsWithDeposits.splice(accountIndex, 1)  // Remove the element
            entity.deposits = accountsWithDeposits  // Assign back the modified array
        }
    }

    // Handle accounts with positions based on debt
    if (hasBorrows) {
        if (entity.borrows.includes(trackingId) === false) {
            let accountsWithBorrows = entity.borrows
            entity.borrows = accountsWithBorrows.concat([trackingId])
        }
        // we only remove if there is a previous deposit
    } else if (balanceEntity.debt.gt(BigInt.fromI32(0))) {
        let accountIndex = entity.borrows.indexOf(trackingId)
        if (entity.borrows.includes(trackingId) === true) {
            let accountsWithBorrows = entity.borrows
            accountsWithBorrows.splice(accountIndex, 1)  // Remove the element
            entity.borrows = accountsWithBorrows  // Assign back the modified array
        }
    }
    // Last update
    entity.blockTimestamp = blockTimestamp
    entity.blockNumber = blockNumber
    entity.transactionHash = transactionHash
    entity.save()

    // Update balances
    balanceEntity.mainAddress = mainAddress
    balanceEntity.account = account
    balanceEntity.balance = balance
    balanceEntity.debt = debt
    balanceEntity.isControllerEnabled = isControllerEnabled
    balanceEntity.vault = vault
    balanceEntity.blockTimestamp = blockTimestamp
    balanceEntity.blockNumber = blockNumber
    balanceEntity.transactionHash = transactionHash
    balanceEntity.save()

}

////////////////////////////////////////////////////////////
// TRACKING ACTIONS IN EARN VAULTS
////////////////////////////////////////////////////////////

export function trackActionsInEarnVaults(
    account: Bytes,
    vault: Bytes,
    blockNumber: BigInt,
    blockTimestamp: BigInt,
    transactionHash: Bytes,
): void {
    const evcContractAddress = loadEVaultConnector()
    const accountEntity = loadSubAccount(account, evcContractAddress)
    updateActiveAccountsInEarnVaults(accountEntity.owner, account, vault, evcContractAddress, blockNumber, blockTimestamp, transactionHash)
}

function updateActiveAccountsInEarnVaults(
    mainAddress: Bytes,
    account: Bytes,
    vault: Bytes,
    _evc: Bytes,
    blockNumber: BigInt,
    blockTimestamp: BigInt,
    transactionHash: Bytes,
): void {
    // Don't track if the main address is the zero address
    if (mainAddress.equals(zeroAddress)) return

    let vaultContract = EulerEarn.bind(Address.fromBytes(vault))
    let entity = loadTrackingActiveAccounts(mainAddress)

    // Load the vault contract and check balance and debt
    let balance = vaultContract.balanceOf(Address.fromBytes(account))

    let hasDeposits = balance.gt(BigInt.fromI32(0))
    let trackingId = account.concat(vault)
    // Tracking balances on vaults 
    let balanceEntity = TrackingVaultBalance.load(trackingId)
    if (!balanceEntity) {
        balanceEntity = new TrackingVaultBalance(account.concat(vault))
        balanceEntity.isControllerEnabled = false
        balanceEntity.balance = BigInt.fromI32(0)
        balanceEntity.debt = BigInt.fromI32(0)
    }

    // Handle main accounts list based on liquidity
    if (hasDeposits) {
        // ONLY FOR READABILITY
        if (entity.deposits.includes(trackingId) === false) {
            let accountsWithDeposits = entity.deposits
            entity.deposits = accountsWithDeposits.concat([trackingId])
        }
        // we only remove if there is a previous deposit
    } else if (balanceEntity.balance.gt(BigInt.fromI32(0))) {
        let accountIndex = entity.deposits.indexOf(trackingId)
        if (entity.deposits.includes(trackingId) === true) {
            let accountsWithDeposits = entity.deposits
            accountsWithDeposits.splice(accountIndex, 1)  // Remove the element
            entity.deposits = accountsWithDeposits  // Assign back the modified array
        }
    }

    // Last update
    entity.blockTimestamp = blockTimestamp
    entity.blockNumber = blockNumber
    entity.transactionHash = transactionHash
    entity.save()

    // Update balances
    balanceEntity.mainAddress = mainAddress
    balanceEntity.account = account
    balanceEntity.balance = balance
    balanceEntity.debt = BigInt.fromI32(0)
    balanceEntity.isControllerEnabled = false
    balanceEntity.vault = vault
    balanceEntity.blockTimestamp = blockTimestamp
    balanceEntity.blockNumber = blockNumber
    balanceEntity.transactionHash = transactionHash
    balanceEntity.save()

}