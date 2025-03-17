import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
 
import { createMockedFunction, log } from "matchstick-as"
import {
  assert,
  afterEach,
  beforeEach,
  clearStore,
  describe,
  test,
} from "matchstick-as/assembly/index"
import {
  TrackingActiveAccount,
  TrackingVaultBalance,
} from "../generated/schema"
import { updateActiveAccountsInEVaults } from "../src/utils/tracking"

describe("updateUserActiveAccounts", () => {
  beforeEach(() => {
    clearStore() // Clear store before each test
  })

  test("should track deposits and borrows correctly", () => {
    // Setup test data
    let mainAddress = Address.fromString(
      "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
    )
    let account = Address.fromString(
      "0x0000000000000000000000000000000000000001",
    )
    let vault = Address.fromString("0x0000000000000000000000000000000000000002")
    let evc = Address.fromString("0x0000000000000000000000000000000000000003")
    let trackingId = account.concat(vault)
    // Mock the EVault contract calls
    createMockedFunction(vault, "balanceOf", "balanceOf(address):(uint256)")
      // @ts-ignore: Type mismatch between graph-ts and matchstick-as
      .withArgs([ethereum.Value.fromAddress(account)] )
       // @ts-ignore: Type mismatch between graph-ts and matchstick-as
      .returns([ethereum.Value.fromI32(100)] ) // Mock deposit balance of 100

    createMockedFunction(vault, "debtOf", "debtOf(address):(uint256)")
       // @ts-ignore: Type mismatch between graph-ts and matchstick-as
      .withArgs([ethereum.Value.fromAddress(account)] )
      // @ts-ignore: Type mismatch between graph-ts and matchstick-as
      .returns([ethereum.Value.fromI32(50)]) // Mock debt of 50

    createMockedFunction(evc, "isControllerEnabled", "isControllerEnabled(address,address):(bool)")
      // @ts-ignore: Type mismatch between graph-ts and matchstick-as
      .withArgs([ethereum.Value.fromAddress(account), ethereum.Value.fromAddress(vault)])
      // @ts-ignore: Type mismatch between graph-ts and matchstick-as
      .returns([ethereum.Value.fromBoolean(true)])

    // Call the function
    updateActiveAccountsInEVaults(
      Bytes.fromHexString(mainAddress.toHexString()),
      Bytes.fromHexString(account.toHexString()),
      Bytes.fromHexString(vault.toHexString()),
      Bytes.fromHexString(evc.toHexString()),
      BigInt.fromI32(1),
      BigInt.fromI32(1234567),
      Bytes.fromHexString("0x1234"),
    )
    // Assert TrackingActiveAccount entity
    let trackingEntity = TrackingActiveAccount.load(mainAddress)
    
    assert.assertNotNull(trackingEntity)
    log.warning('ok 0',[])
    if (trackingEntity) {
      assert.i32Equals(trackingEntity.deposits.length, 1)
      assert.i32Equals(trackingEntity.borrows.length, 1)
      assert.bytesEquals(
        trackingEntity.deposits[0],
        trackingId,
      )
      assert.bytesEquals(
        trackingEntity.borrows[0],
        trackingId,
      )
    }
   
    // Assert TrackingVaultBalance entity
    let balanceEntity = TrackingVaultBalance.load(trackingId)
    assert.assertNotNull(balanceEntity)
    if (balanceEntity) {
      if(balanceEntity.balance) assert.bigIntEquals(balanceEntity.balance, BigInt.fromI32(100))
      if(balanceEntity.debt) assert.bigIntEquals(balanceEntity.debt, BigInt.fromI32(50))
      assert.bytesEquals(
        balanceEntity.mainAddress,
        Bytes.fromHexString(mainAddress.toHexString()),
      )
      assert.bytesEquals(
        balanceEntity.account,
        Bytes.fromHexString(account.toHexString()),
      )
      assert.bytesEquals(
        balanceEntity.vault,
        Bytes.fromHexString(vault.toHexString()),
      )
    }
    
    // Test removing deposits and borrows
    // Mock zero balances
    createMockedFunction(vault, "balanceOf", "balanceOf(address):(uint256)")
       // @ts-ignore: Type mismatch between graph-ts and matchstick-as
      .withArgs([ethereum.Value.fromAddress(account)])
       // @ts-ignore: Type mismatch between graph-ts and matchstick-as
      .returns([ethereum.Value.fromI32(0)])

    createMockedFunction(vault, "debtOf", "debtOf(address):(uint256)")
      // @ts-ignore: Type mismatch between graph-ts and matchstick-as
      .withArgs([ethereum.Value.fromAddress(account)])
      // @ts-ignore: Type mismatch between graph-ts and matchstick-as
      .returns([ethereum.Value.fromI32(0)])

    createMockedFunction(evc, "isControllerEnabled", "isControllerEnabled(address,address):(bool)")
      // @ts-ignore: Type mismatch between graph-ts and matchstick-as
      .withArgs([ethereum.Value.fromAddress(account), ethereum.Value.fromAddress(vault)])
      // @ts-ignore: Type mismatch between graph-ts and matchstick-as
      .returns([ethereum.Value.fromBoolean(false)])
    // Call function again
    updateActiveAccountsInEVaults(
      Bytes.fromHexString(mainAddress.toHexString()),
      Bytes.fromHexString(account.toHexString()),
      Bytes.fromHexString(vault.toHexString()),
      Bytes.fromHexString(evc.toHexString()),
      BigInt.fromI32(2),
      BigInt.fromI32(1234568),
      Bytes.fromHexString("0x1235"),
    )

    // Assert arrays are empty
    let trackingEntityRemove = TrackingActiveAccount.load(
      mainAddress
    )
    assert.assertNotNull(trackingEntity)
    if (trackingEntityRemove) {
      assert.i32Equals(trackingEntityRemove.deposits.length, 0)
      assert.i32Equals(trackingEntityRemove.borrows.length, 0)
    }
    // Assert balance updates
    let balanceEntityRemove = TrackingVaultBalance.load(trackingId)
    assert.assertNotNull(balanceEntityRemove)
    if (balanceEntityRemove) {
      if(balanceEntityRemove.balance) assert.bigIntEquals(balanceEntityRemove.balance, BigInt.fromI32(0))
      if(balanceEntityRemove.debt) assert.bigIntEquals(balanceEntityRemove.debt, BigInt.fromI32(0))
    }
  })
})
