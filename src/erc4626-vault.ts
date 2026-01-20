import {
  Deposit as DepositEvent,
  Transfer as TransferEvent,
  Withdraw as WithdrawEvent,
} from "../generated/templates/ERC4626Vault/EulerEarn"
import { trackActions } from "./utils/tracking"

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
