import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import { DeployEulerEarn } from "../generated/EulerEarnFactory/EulerEarnFactory"

// export function createDeployEulerEarnEvent(
//   _owner: Address,
//   _eulerEarnVault: Address,
//   _asset: Address
// ): DeployEulerEarn {
//   let deployEulerEarnEvent = changetype<DeployEulerEarn>(newMockEvent())

//   deployEulerEarnEvent.parameters = new Array()

//   deployEulerEarnEvent.parameters.push(
//     new ethereum.EventParam("_owner", ethereum.Value.fromAddress(_owner))
//   )
//   deployEulerEarnEvent.parameters.push(
//     new ethereum.EventParam(
//       "_eulerEarnVault",
//       ethereum.Value.fromAddress(_eulerEarnVault)
//     )
//   )
//   deployEulerEarnEvent.parameters.push(
//     new ethereum.EventParam("_asset", ethereum.Value.fromAddress(_asset))
//   )

//   return deployEulerEarnEvent
// }


