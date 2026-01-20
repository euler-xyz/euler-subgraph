import {
  Borrow as BorrowEvent,
  ConvertFees as ConvertFeesEvent,
  Deposit as DepositEvent,
  Liquidate as LiquidateEvent,
  Repay as RepayEvent,
  Transfer as TransferEvent,
  Withdraw as WithdrawEvent,
  PullDebt as PullDebtEvent,
} from "../generated/templates/EulerVault/EulerVault"
import { trackActions } from "./utils/tracking"

//////////////////////////////////////////////////////////
// DEPOSIT/WITHDRAW EVENTS
//////////////////////////////////////////////////////////

export function handleDeposit(event: DepositEvent): void {
  trackActions(
    event.params.owner,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

export function handleWithdraw(event: WithdrawEvent): void {
  trackActions(
    event.params.owner,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

export function handleTransfer(event: TransferEvent): void {
  trackActions(
    event.params.from,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  trackActions(
    event.params.to,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

//////////////////////////////////////////////////////////
// BORROW/REPAY EVENTS
//////////////////////////////////////////////////////////

export function handleBorrow(event: BorrowEvent): void {
  trackActions(
    event.params.account,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

export function handleRepay(event: RepayEvent): void {
  trackActions(
    event.params.account,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

export function handlePullDebt(event: PullDebtEvent): void {
  trackActions(
    event.params.from,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  trackActions(
    event.params.to,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

//////////////////////////////////////////////////////////
// LIQUIDATION EVENTS
//////////////////////////////////////////////////////////

export function handleLiquidate(event: LiquidateEvent): void {
  trackActions(
    event.params.liquidator,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  trackActions(
    event.params.violator,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}

//////////////////////////////////////////////////////////
// FEE EVENTS
//////////////////////////////////////////////////////////

export function handleConvertFees(event: ConvertFeesEvent): void {
  trackActions(
    event.params.protocolReceiver,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  trackActions(
    event.params.governorReceiver,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}
