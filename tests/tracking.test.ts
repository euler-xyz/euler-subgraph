import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { createMockedFunction } from "matchstick-as"
import {
  assert,
  beforeEach,
  clearStore,
  describe,
  test,
} from "matchstick-as/assembly/index"
import {
  TrackingActiveAccount,
  TrackingVaultBalance,
} from "../generated/schema"
import { trackActions } from "../src/utils/tracking"

// Helper to get addressPrefix (first 19 bytes)
function getAddressPrefix(address: Bytes): Bytes {
  return Bytes.fromUint8Array(address.slice(0, 19))
}

describe("trackActions", () => {
  beforeEach(() => {
    clearStore()
  })

  test("tracks deposit when balance > 0", () => {
    let account = Address.fromString("0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7")
    let vault = Address.fromString("0x1111111111111111111111111111111111111111")
    let trackingId = Bytes.fromHexString(account.toHexString()).concat(Bytes.fromHexString(vault.toHexString()))
    let addressPrefix = getAddressPrefix(Bytes.fromHexString(account.toHexString()))

    createMockedFunction(vault, "balanceOf", "balanceOf(address):(uint256)")
      .withArgs([ethereum.Value.fromAddress(account)])
      .returns([ethereum.Value.fromI32(100)])

    createMockedFunction(vault, "debtOf", "debtOf(address):(uint256)")
      .withArgs([ethereum.Value.fromAddress(account)])
      .returns([ethereum.Value.fromI32(0)])

    trackActions(
      Bytes.fromHexString(account.toHexString()),
      Bytes.fromHexString(vault.toHexString()),
      BigInt.fromI32(1),
      BigInt.fromI32(1000),
      Bytes.fromHexString("0xabc123"),
    )

    let entity = TrackingActiveAccount.load(addressPrefix)
    assert.assertNotNull(entity)
    if (entity) {
      assert.i32Equals(entity.deposits.length, 1)
      assert.i32Equals(entity.borrows.length, 0)
    }

    let balance = TrackingVaultBalance.load(trackingId)
    assert.assertNotNull(balance)
    if (balance) {
      assert.bigIntEquals(balance.balance, BigInt.fromI32(100))
      assert.bigIntEquals(balance.debt, BigInt.fromI32(0))
    }
  })

  test("tracks borrow when debt > 0", () => {
    let account = Address.fromString("0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7")
    let vault = Address.fromString("0x1111111111111111111111111111111111111111")
    let addressPrefix = getAddressPrefix(Bytes.fromHexString(account.toHexString()))

    createMockedFunction(vault, "balanceOf", "balanceOf(address):(uint256)")
      .withArgs([ethereum.Value.fromAddress(account)])
      .returns([ethereum.Value.fromI32(0)])

    createMockedFunction(vault, "debtOf", "debtOf(address):(uint256)")
      .withArgs([ethereum.Value.fromAddress(account)])
      .returns([ethereum.Value.fromI32(50)])

    trackActions(
      Bytes.fromHexString(account.toHexString()),
      Bytes.fromHexString(vault.toHexString()),
      BigInt.fromI32(1),
      BigInt.fromI32(1000),
      Bytes.fromHexString("0xabc123"),
    )

    let entity = TrackingActiveAccount.load(addressPrefix)
    assert.assertNotNull(entity)
    if (entity) {
      assert.i32Equals(entity.deposits.length, 0)
      assert.i32Equals(entity.borrows.length, 1)
    }
  })

  test("removes deposit when balance becomes 0", () => {
    let account = Address.fromString("0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7")
    let vault = Address.fromString("0x1111111111111111111111111111111111111111")
    let addressPrefix = getAddressPrefix(Bytes.fromHexString(account.toHexString()))

    // First: add deposit
    createMockedFunction(vault, "balanceOf", "balanceOf(address):(uint256)")
      .withArgs([ethereum.Value.fromAddress(account)])
      .returns([ethereum.Value.fromI32(100)])

    createMockedFunction(vault, "debtOf", "debtOf(address):(uint256)")
      .withArgs([ethereum.Value.fromAddress(account)])
      .returns([ethereum.Value.fromI32(0)])

    trackActions(
      Bytes.fromHexString(account.toHexString()),
      Bytes.fromHexString(vault.toHexString()),
      BigInt.fromI32(1),
      BigInt.fromI32(1000),
      Bytes.fromHexString("0xabc123"),
    )

    // Then: remove deposit
    createMockedFunction(vault, "balanceOf", "balanceOf(address):(uint256)")
      .withArgs([ethereum.Value.fromAddress(account)])
      .returns([ethereum.Value.fromI32(0)])

    createMockedFunction(vault, "debtOf", "debtOf(address):(uint256)")
      .withArgs([ethereum.Value.fromAddress(account)])
      .returns([ethereum.Value.fromI32(0)])

    trackActions(
      Bytes.fromHexString(account.toHexString()),
      Bytes.fromHexString(vault.toHexString()),
      BigInt.fromI32(2),
      BigInt.fromI32(2000),
      Bytes.fromHexString("0xdef456"),
    )

    let entity = TrackingActiveAccount.load(addressPrefix)
    assert.assertNotNull(entity)
    if (entity) {
      assert.i32Equals(entity.deposits.length, 0)
    }
  })

  test("skips zero address", () => {
    let zeroAddress = Address.zero()
    let vault = Address.fromString("0x1111111111111111111111111111111111111111")
    let addressPrefix = getAddressPrefix(Bytes.fromHexString(zeroAddress.toHexString()))

    trackActions(
      Bytes.fromHexString(zeroAddress.toHexString()),
      Bytes.fromHexString(vault.toHexString()),
      BigInt.fromI32(1),
      BigInt.fromI32(1000),
      Bytes.fromHexString("0xabc123"),
    )

    let entity = TrackingActiveAccount.load(addressPrefix)
    assert.assertNull(entity)
  })
})

