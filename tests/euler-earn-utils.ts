// import { newMockEvent } from "matchstick-as"
// import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
// import {
//   Approval,
//   DelegateChanged,
//   DelegateVotesChanged,
//   Deposit,
//   EIP712DomainChanged,
//   Initialized,
//   RoleAdminChanged,
//   RoleGranted,
//   RoleRevoked,
//   Transfer,
//   Withdraw
// } from "../generated/EulerEarn/EulerEarn"

// export function createApprovalEvent(
//   owner: Address,
//   spender: Address,
//   value: BigInt
// ): Approval {
//   let approvalEvent = changetype<Approval>(newMockEvent())

//   approvalEvent.parameters = new Array()

//   approvalEvent.parameters.push(
//     new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
//   )
//   approvalEvent.parameters.push(
//     new ethereum.EventParam("spender", ethereum.Value.fromAddress(spender))
//   )
//   approvalEvent.parameters.push(
//     new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
//   )

//   return approvalEvent
// }

// export function createDelegateChangedEvent(
//   delegator: Address,
//   fromDelegate: Address,
//   toDelegate: Address
// ): DelegateChanged {
//   let delegateChangedEvent = changetype<DelegateChanged>(newMockEvent())

//   delegateChangedEvent.parameters = new Array()

//   delegateChangedEvent.parameters.push(
//     new ethereum.EventParam("delegator", ethereum.Value.fromAddress(delegator))
//   )
//   delegateChangedEvent.parameters.push(
//     new ethereum.EventParam(
//       "fromDelegate",
//       ethereum.Value.fromAddress(fromDelegate)
//     )
//   )
//   delegateChangedEvent.parameters.push(
//     new ethereum.EventParam(
//       "toDelegate",
//       ethereum.Value.fromAddress(toDelegate)
//     )
//   )

//   return delegateChangedEvent
// }

// export function createDelegateVotesChangedEvent(
//   delegate: Address,
//   previousVotes: BigInt,
//   newVotes: BigInt
// ): DelegateVotesChanged {
//   let delegateVotesChangedEvent = changetype<DelegateVotesChanged>(
//     newMockEvent()
//   )

//   delegateVotesChangedEvent.parameters = new Array()

//   delegateVotesChangedEvent.parameters.push(
//     new ethereum.EventParam("delegate", ethereum.Value.fromAddress(delegate))
//   )
//   delegateVotesChangedEvent.parameters.push(
//     new ethereum.EventParam(
//       "previousVotes",
//       ethereum.Value.fromUnsignedBigInt(previousVotes)
//     )
//   )
//   delegateVotesChangedEvent.parameters.push(
//     new ethereum.EventParam(
//       "newVotes",
//       ethereum.Value.fromUnsignedBigInt(newVotes)
//     )
//   )

//   return delegateVotesChangedEvent
// }

// export function createDepositEvent(
//   sender: Address,
//   owner: Address,
//   assets: BigInt,
//   shares: BigInt
// ): Deposit {
//   let depositEvent = changetype<Deposit>(newMockEvent())

//   depositEvent.parameters = new Array()

//   depositEvent.parameters.push(
//     new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
//   )
//   depositEvent.parameters.push(
//     new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
//   )
//   depositEvent.parameters.push(
//     new ethereum.EventParam("assets", ethereum.Value.fromUnsignedBigInt(assets))
//   )
//   depositEvent.parameters.push(
//     new ethereum.EventParam("shares", ethereum.Value.fromUnsignedBigInt(shares))
//   )

//   return depositEvent
// }

// export function createEIP712DomainChangedEvent(): EIP712DomainChanged {
//   let eip712DomainChangedEvent = changetype<EIP712DomainChanged>(newMockEvent())

//   eip712DomainChangedEvent.parameters = new Array()

//   return eip712DomainChangedEvent
// }

// export function createInitializedEvent(version: BigInt): Initialized {
//   let initializedEvent = changetype<Initialized>(newMockEvent())

//   initializedEvent.parameters = new Array()

//   initializedEvent.parameters.push(
//     new ethereum.EventParam(
//       "version",
//       ethereum.Value.fromUnsignedBigInt(version)
//     )
//   )

//   return initializedEvent
// }

// export function createRoleAdminChangedEvent(
//   role: Bytes,
//   previousAdminRole: Bytes,
//   newAdminRole: Bytes
// ): RoleAdminChanged {
//   let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

//   roleAdminChangedEvent.parameters = new Array()

//   roleAdminChangedEvent.parameters.push(
//     new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
//   )
//   roleAdminChangedEvent.parameters.push(
//     new ethereum.EventParam(
//       "previousAdminRole",
//       ethereum.Value.fromFixedBytes(previousAdminRole)
//     )
//   )
//   roleAdminChangedEvent.parameters.push(
//     new ethereum.EventParam(
//       "newAdminRole",
//       ethereum.Value.fromFixedBytes(newAdminRole)
//     )
//   )

//   return roleAdminChangedEvent
// }

// export function createRoleGrantedEvent(
//   role: Bytes,
//   account: Address,
//   sender: Address
// ): RoleGranted {
//   let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

//   roleGrantedEvent.parameters = new Array()

//   roleGrantedEvent.parameters.push(
//     new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
//   )
//   roleGrantedEvent.parameters.push(
//     new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
//   )
//   roleGrantedEvent.parameters.push(
//     new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
//   )

//   return roleGrantedEvent
// }

// export function createRoleRevokedEvent(
//   role: Bytes,
//   account: Address,
//   sender: Address
// ): RoleRevoked {
//   let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

//   roleRevokedEvent.parameters = new Array()

//   roleRevokedEvent.parameters.push(
//     new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
//   )
//   roleRevokedEvent.parameters.push(
//     new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
//   )
//   roleRevokedEvent.parameters.push(
//     new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
//   )

//   return roleRevokedEvent
// }

// export function createTransferEvent(
//   from: Address,
//   to: Address,
//   value: BigInt
// ): Transfer {
//   let transferEvent = changetype<Transfer>(newMockEvent())

//   transferEvent.parameters = new Array()

//   transferEvent.parameters.push(
//     new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
//   )
//   transferEvent.parameters.push(
//     new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
//   )
//   transferEvent.parameters.push(
//     new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
//   )

//   return transferEvent
// }

// export function createWithdrawEvent(
//   sender: Address,
//   receiver: Address,
//   owner: Address,
//   assets: BigInt,
//   shares: BigInt
// ): Withdraw {
//   let withdrawEvent = changetype<Withdraw>(newMockEvent())

//   withdrawEvent.parameters = new Array()

//   withdrawEvent.parameters.push(
//     new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
//   )
//   withdrawEvent.parameters.push(
//     new ethereum.EventParam("receiver", ethereum.Value.fromAddress(receiver))
//   )
//   withdrawEvent.parameters.push(
//     new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
//   )
//   withdrawEvent.parameters.push(
//     new ethereum.EventParam("assets", ethereum.Value.fromUnsignedBigInt(assets))
//   )
//   withdrawEvent.parameters.push(
//     new ethereum.EventParam("shares", ethereum.Value.fromUnsignedBigInt(shares))
//   )

//   return withdrawEvent
// }
