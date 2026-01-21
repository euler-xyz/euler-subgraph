import {
  Borrow as BorrowEvent,
  Repay as RepayEvent,
  Transfer as TransferEvent,
} from "../generated/templates/EulerVault/EulerVault"
import { trackActions } from "./utils/tracking"

//////////////////////////////////////////////////////////
// TRANSFER EVENT
//////////////////////////////////////////////////////////

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
