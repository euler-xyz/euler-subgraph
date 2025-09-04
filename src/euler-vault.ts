import {
  Approval as ApprovalEvent,
  BalanceForwarderStatus as BalanceForwarderStatusEvent,
  Borrow as BorrowEvent,
  ConvertFees as ConvertFeesEvent,
  DebtSocialized as DebtSocializedEvent,
  Deposit as DepositEvent,
  EVaultCreated as EVaultCreatedEvent,
  InterestAccrued as InterestAccruedEvent,
  Liquidate as LiquidateEvent,
  Repay as RepayEvent,
  Transfer as TransferEvent,
  VaultStatus as VaultStatusEvent,
  Withdraw as WithdrawEvent,
  PullDebt as PullDebtEvent,
} from "../generated/templates/EulerVault/EulerVault"
import {
  BalanceForwarderStatus,
  Borrow,
  CallWithContext,
  ConvertFee,
  DebtSocialized,
  Deposit,
  EVaultCreated,
  InterestAccrued,
  Liquidate,
  Repay,
  Transfer,
  VaultStatus,
  Withdraw,
  PullDebt,
} from "../generated/schema"
import { increaseCounter } from "./utils/counter"
import { trackActionsInEVaults } from "./utils/tracking"
import { loadOrCreateEulerVault, updateEulerVault } from "./utils/clasicVaut"
import { ethereum } from "@graphprotocol/graph-ts"
import { computeAPYs } from "./utils/math"
import { checkPerspectives } from "./utils/perspectives"


//////////////////////////////////////////////////////////
// STATUS EVENTS
//////////////////////////////////////////////////////////
export function handleEVaultCreated(event: EVaultCreatedEvent): void {
  let entity = new EVaultCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.evault = event.address
  entity.creator = event.params.creator
  entity.asset = event.params.asset
  entity.dToken = event.params.dToken

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  increaseCounter(
    "eVaultCreated",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
  entity.save()

  // Create or update the vault
  let eVault = loadOrCreateEulerVault(event.address)
  // We update the vault
  eVault.blockNumber = event.block.number
  eVault.blockTimestamp = event.block.timestamp
  eVault.transactionHash = event.transaction.hash
  eVault.save()
}

export function handleBalanceForwarderStatus(
  event: BalanceForwarderStatusEvent,
): void {
  let entity = new BalanceForwarderStatus(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.vault = event.address
  entity.account = event.params.account
  entity.status = event.params.status

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  increaseCounter(
    "balanceForwarder",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  entity.save()


  trackActionsInEVaults(
    event.params.account,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

export function handleDebtSocialized(event: DebtSocializedEvent): void {
  let entity = new DebtSocialized(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.vault = event.address
  entity.account = event.params.account
  entity.assets = event.params.assets

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  increaseCounter(
    "debtSocialized",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  entity.save()

  trackActionsInEVaults(
    event.params.account,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

export function handleInterestAccrued(event: InterestAccruedEvent): void {
  let entity = new InterestAccrued(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.vault = event.address
  entity.account = event.params.account
  entity.assets = event.params.assets

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  increaseCounter(
    "interestAccrued", // also called redeem
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  entity.save()
}

export function handleConvertFees(event: ConvertFeesEvent): void {
  let entity = new ConvertFee(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.vault = event.address
  entity.sender = event.params.sender
  entity.protocolReceiver = event.params.protocolReceiver
  entity.governorReceiver = event.params.governorReceiver
  entity.protocolShares = event.params.protocolShares
  entity.governorShares = event.params.governorShares

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  increaseCounter(
    "convertfees",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  entity.save()

}

export function handlePullDebt(event: PullDebtEvent): void {
  let entity = new PullDebt(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.vault = event.address
  entity.from = event.params.from
  entity.to = event.params.to
  entity.assets = event.params.assets

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVaultStatus(event: VaultStatusEvent): void {
  let entity = new VaultStatus(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.vault = event.address
  entity.totalShares = event.params.totalShares
  entity.totalBorrows = event.params.totalBorrows
  entity.accumulatedFees = event.params.accumulatedFees
  entity.cash = event.params.cash
  entity.interestAccumulator = event.params.interestAccumulator
  entity.interestRate = event.params.interestRate
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  // Update state of the vault
  let vault = loadOrCreateEulerVault(event.address)
  // Update the APYs
  let apys = computeAPYs(event.params.interestRate, event.params.cash, event.params.totalBorrows, vault.interestFee)
  entity.borrowApy = apys[0]
  entity.supplyApy = apys[1]

  // Update vault to the latest state
  vault.state = entity.id
  vault.perspectives = checkPerspectives(event.address)
  // save the entity

  entity.save()
  vault.save()

  let callWithContext = CallWithContext.load(event.transaction.hash.concat(event.address))

  if (callWithContext) {
    for (let i = 0; i < callWithContext.accounts.length; i++) {
      trackActionsInEVaults(
        callWithContext.accounts[i],
        event.address,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash,
      )
    }
  }
}

//////////////////////////////////////////////////////////
// ACTIONS EVENTS
//////////////////////////////////////////////////////////

export function handleBorrow(event: BorrowEvent): void {

  let entity = new Borrow(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )

  entity.account = event.params.account
  entity.assets = event.params.assets
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
  increaseCounter(
    "borrow",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  trackActionsInEVaults(
    event.params.account,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

}

export function handleDeposit(event: DepositEvent): void {
  let entity = new Deposit(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.sender = event.params.sender
  entity.owner = event.params.owner
  entity.assets = event.params.assets
  entity.shares = event.params.shares
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // the deposit also create
  increaseCounter(
    "deposit", // also called by mint and skim
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  // Status from the sender
  trackActionsInEVaults(
    event.params.sender,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  if (event.params.sender !== event.params.owner) {
    // Status from the owner
    trackActionsInEVaults(
      event.params.owner,
      event.address,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
    )
  }
}

export function handleLiquidate(event: LiquidateEvent): void {
  let entity = new Liquidate(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.vault = event.address
  entity.liquidator = event.params.liquidator
  entity.violator = event.params.violator
  entity.collateral = event.params.collateral
  entity.repayAssets = event.params.repayAssets
  entity.yieldBalance = event.params.yieldBalance

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  increaseCounter(
    "liquidate",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  entity.save()

  trackActionsInEVaults(
    event.params.liquidator,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  trackActionsInEVaults(
    event.params.violator,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

}

export function handleRepay(event: RepayEvent): void {
  let entity = new Repay(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )

  entity.vault = event.address
  entity.account = event.params.account
  entity.assets = event.params.assets
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()

  increaseCounter(
    "repay",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  trackActionsInEVaults(
    event.params.account,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.value = event.params.value
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  increaseCounter(
    "transfer",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  entity.save()

  trackActionsInEVaults(
    event.params.from,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  // We check the end account
  trackActionsInEVaults(
    event.params.to,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

}

export function handleWithdraw(event: WithdrawEvent): void {
  let entity = new Withdraw(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.sender = event.params.sender
  entity.receiver = event.params.receiver
  entity.owner = event.params.owner
  entity.assets = event.params.assets
  entity.shares = event.params.shares
  entity.vault = event.address
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()

  increaseCounter(
    "withdraw", // also called redeem
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  trackActionsInEVaults(
    event.params.sender,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  // If it's a self-transfer, we only track the status from the sender
  if (event.params.sender !== event.params.receiver) {
    trackActionsInEVaults(
      event.params.receiver,
      event.address,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
    )
  }

  if (event.params.sender !== event.params.owner) {
    trackActionsInEVaults(
      event.params.owner,
      event.address,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
    )
  }

}

//////////////////////////////////////////////////////////
// GOVERNANCE EVENTS
//////////////////////////////////////////////////////////

export function handleUpdateVaultData(event: ethereum.Event): void {
  updateEulerVault(event.address)
}