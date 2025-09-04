import { CallWithContext as CallWithContextEvent } from "../generated/EthereumVaultConnector/EthereumVaultConnector";
import { BORROW_SELECTOR, CONVERT_FEES_SELECTOR, DEPOSIT_PERMIT_SELECTOR, DEPOSIT_SELECTOR, EVAULT_SELECTORS, LIQUIDATE_SELECTOR, MINT_SELECTOR, PULL_DEBT_SELECTOR, REDEEM_SELECTOR, REPAY_SELECTOR, REPAY_WITH_SHARES_SELECTOR, SKIM_SELECTOR, TOUCH_SELECTOR, TRANSFER_FROM_MAX_SELECTOR, TRANSFER_FROM_SELECTOR, TRANSFER_SELECTOR, WITHDRAW_SELECTOR } from "./utils/constants";
import { VaultByAccount, AccountAggrVault, CallWithContext } from "../generated/schema";
import { Bytes, dataSource, log } from "@graphprotocol/graph-ts";


function updateAccount(id: Bytes, contractAddress: Bytes): void {
    let account = AccountAggrVault.load(id)
    if (!account) {
        account = new AccountAggrVault(id)
        account.accountPrefix = id
        account.save()
    }
    let vault = VaultByAccount.load(id.concat(contractAddress))
    if (!vault) {
        vault = new VaultByAccount(id.concat(contractAddress))
        vault.account = account.id
        vault.vault = contractAddress
        vault.save()
    }
}

function getTypeBySelector(selector: string): string {
    if (selector === TRANSFER_SELECTOR) {
        return "transfer"
    } else if (selector === TRANSFER_FROM_SELECTOR) {
        return "transfer"
    } else if (selector === TRANSFER_FROM_MAX_SELECTOR) {
        return "transfer"
    } else if (selector === DEPOSIT_SELECTOR) {
        return "deposit"
    } else if (selector === DEPOSIT_PERMIT_SELECTOR) {
        return "depositPermit"
    } else if (selector === MINT_SELECTOR) {
        return "mint"
    } else if (selector === WITHDRAW_SELECTOR) {
        return "withdraw"
    } else if (selector === REDEEM_SELECTOR) {
        return "redeem"
    } else if (selector === SKIM_SELECTOR) {
        return "skim"
    } else if (selector === BORROW_SELECTOR) {
        return "borrow"
    } else if (selector === REPAY_SELECTOR) {
        return "repay"
    } else if (selector === REPAY_WITH_SHARES_SELECTOR) {
        return "repayWithShares"
    } else if (selector === PULL_DEBT_SELECTOR) {
        return "pullDebt"
    } else if (selector === TOUCH_SELECTOR) {
        return "touch"
    } else if (selector === LIQUIDATE_SELECTOR) {
        return "liquidate"
    } else if (selector === CONVERT_FEES_SELECTOR) {
        return "pullDebt"
    }
    return "unknown"
}


export function loadOrCreateCallWithContext(event: CallWithContextEvent): CallWithContext {
    let entity = CallWithContext.load(event.transaction.hash.concat(event.params.targetContract))
    if (!entity) {
        entity = new CallWithContext(event.transaction.hash.concat(event.params.targetContract))
        entity.vault = event.params.targetContract
        entity.mainAddress = event.transaction.from
        entity.evc = event.address
        entity.accounts = []
    }
    return entity
}

export function handleCallWithContext(event: CallWithContextEvent): void {
    const selector = event.params.selector.toHexString().slice(0, 10).toLowerCase()
    const isSelector = EVAULT_SELECTORS.includes(selector)
    const address = event.params.onBehalfOfAccount
    const from = event.transaction.from;
    const context = dataSource.context()
    log.warning("evcAddress: {}", [event.address.toHexString()])
    context.setString("evcAddress", event.address.toHexString())
    // If it's the same we can ignore it
    // This case is when for example the swap contract interact with the vault.
    const entity = loadOrCreateCallWithContext(event)
    const type = getTypeBySelector(selector)

    entity.selector = selector
    let accounts = entity.accounts
    // If we already have this address, we can ignore it
    if (!accounts.includes(address)) {
        entity.accounts = accounts.concat([address])
    }
    entity.type = type
    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash

    entity.save()

    if (!isSelector) {
        log.debug("Invalid selector in tx {}", [event.transaction.hash.toHexString()])
        return
    }

    updateAccount(address, event.params.targetContract)
    updateAccount(from, event.params.targetContract)
}

