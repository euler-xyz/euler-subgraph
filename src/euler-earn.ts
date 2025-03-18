import {
  Approval as ApprovalEvent,
  DelegateChanged as DelegateChangedEvent,
  DelegateVotesChanged as DelegateVotesChangedEvent,
  Deposit as DepositEvent,
  Transfer as TransferEvent,
  Withdraw as WithdrawEvent,
} from "../generated/templates/EulerEarn/EulerEarn"
import {
  EulerEarnApproval as Approval,
  EulerEarnDeposit as Deposit,
  EulerEarnTransfer as Transfer,
  EulerEarnWithdraw as Withdraw,
} from "../generated/schema"
import { trackActionsInEarnVaults } from "./utils/tracking"
import { increaseCounter } from "./utils/counter"

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.owner = event.params.owner
  entity.spender = event.params.spender
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()


  increaseCounter(
    "EarnVaultApproval",
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

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultDeposit",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  trackActionsInEarnVaults(
    event.params.sender,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  if (event.params.sender !== event.params.owner) {
    // Status from the owner
    trackActionsInEarnVaults(
      event.params.owner,
      event.address,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
    )
  }
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  increaseCounter(
    "EarnVaultTransfer",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  trackActionsInEarnVaults(
    event.params.from,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  // We check the end account
  trackActionsInEarnVaults(
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

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()


  increaseCounter(
    "EarnVaultWithdraw",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  trackActionsInEarnVaults(
    event.params.sender,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  // If it's a self-transfer, we only track the status from the sender
  if (event.params.sender !== event.params.receiver) {
    trackActionsInEarnVaults(
      event.params.receiver,
      event.address,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
    )
  }

  // If it's a self-transfer, we only track the status from the sender
  if (event.params.sender !== event.params.owner) {
    trackActionsInEarnVaults(
      event.params.owner,
      event.address,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
    )
  }
}
