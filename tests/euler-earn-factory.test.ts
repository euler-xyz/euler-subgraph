// import {
//   assert,
//   describe,
//   test,
//   clearStore,
//   beforeAll,
//   afterAll
// } from "matchstick-as/assembly/index"
// import { Address } from "@graphprotocol/graph-ts"
// import { DeployEulerEarn } from "../generated/schema"
// import { DeployEulerEarn as DeployEulerEarnEvent } from "../generated/EulerEarnFactory/EulerEarnFactory"
// import { handleDeployEulerEarn } from "../src/factories/euler-earn-factory"
// import { createDeployEulerEarnEvent } from "./euler-earn-factory-utils"

// // Tests structure (matchstick-as >=0.5.0)
// // https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

// describe("Describe entity assertions", () => {
//   beforeAll(() => {
//     let _owner = Address.fromString(
//       "0x0000000000000000000000000000000000000001"
//     )
//     let _eulerEarnVault = Address.fromString(
//       "0x0000000000000000000000000000000000000001"
//     )
//     let _asset = Address.fromString(
//       "0x0000000000000000000000000000000000000001"
//     )
//     let newDeployEulerEarnEvent = createDeployEulerEarnEvent(
//       _owner,
//       _eulerEarnVault,
//       _asset
//     )
//     handleDeployEulerEarn(newDeployEulerEarnEvent)
//   })

//   afterAll(() => {
//     clearStore()
//   })

//   // For more test scenarios, see:
//   // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

//   test("DeployEulerEarn created and stored", () => {
//     assert.entityCount("DeployEulerEarn", 1)

//     // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
//     assert.fieldEquals(
//       "DeployEulerEarn",
//       "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
//       "_owner",
//       "0x0000000000000000000000000000000000000001"
//     )
//     assert.fieldEquals(
//       "DeployEulerEarn",
//       "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
//       "_eulerEarnVault",
//       "0x0000000000000000000000000000000000000001"
//     )
//     assert.fieldEquals(
//       "DeployEulerEarn",
//       "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
//       "_asset",
//       "0x0000000000000000000000000000000000000001"
//     )

//     // More assert options:
//     // https://thegraph.com/docs/en/developer/matchstick/#asserts
//   })
// })
