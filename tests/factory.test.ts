import { Address, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { newMockEvent } from "matchstick-as"
import {
  assert,
  beforeEach,
  clearStore,
  describe,
  test,
} from "matchstick-as/assembly/index"
import { Vault } from "../generated/schema"
import { handleProxyCreated } from "../src/factories/euler-vault-factory"
import { handleCreateEulerEarn } from "../src/factories/euler-earn-factory"
import { ProxyCreated } from "../generated/EulerVaultFactory/EVaultFactory"
import { CreateEulerEarn } from "../generated/EulerEarnFactory/EulerEarnFactory"

function createProxyCreatedEvent(proxy: Address, factory: Address): ProxyCreated {
  let event = changetype<ProxyCreated>(newMockEvent())
  event.address = factory
  event.parameters = new Array()
  event.parameters.push(new ethereum.EventParam("proxy", ethereum.Value.fromAddress(proxy)))
  event.parameters.push(new ethereum.EventParam("upgradeable", ethereum.Value.fromBoolean(false)))
  event.parameters.push(new ethereum.EventParam("implementation", ethereum.Value.fromAddress(Address.zero())))
  event.parameters.push(new ethereum.EventParam("data", ethereum.Value.fromBytes(new Bytes(0))))
  return event
}

function createEulerEarnEvent(eulerEarn: Address, factory: Address): CreateEulerEarn {
  let event = changetype<CreateEulerEarn>(newMockEvent())
  event.address = factory
  event.parameters = new Array()
  event.parameters.push(new ethereum.EventParam("eulerEarn", ethereum.Value.fromAddress(eulerEarn)))
  event.parameters.push(new ethereum.EventParam("asset", ethereum.Value.fromAddress(Address.zero())))
  event.parameters.push(new ethereum.EventParam("initialOwner", ethereum.Value.fromAddress(Address.zero())))
  event.parameters.push(new ethereum.EventParam("initialCash", ethereum.Value.fromI32(0)))
  event.parameters.push(new ethereum.EventParam("curator", ethereum.Value.fromAddress(Address.zero())))
  event.parameters.push(new ethereum.EventParam("name", ethereum.Value.fromString("Test")))
  event.parameters.push(new ethereum.EventParam("symbol", ethereum.Value.fromString("TST")))
  event.parameters.push(new ethereum.EventParam("salt", ethereum.Value.fromFixedBytes(new Bytes(32))))
  return event
}

describe("Factory handlers", () => {
  beforeEach(() => {
    clearStore()
  })

  test("EVaultFactory creates Vault entity", () => {
    let vaultAddress = Address.fromString("0x1111111111111111111111111111111111111111")
    let factoryAddress = Address.fromString("0x2222222222222222222222222222222222222222")

    let event = createProxyCreatedEvent(vaultAddress, factoryAddress)
    handleProxyCreated(event)

    let vault = Vault.load(vaultAddress)
    assert.assertNotNull(vault)
    if (vault) {
      assert.bytesEquals(vault.factory, factoryAddress)
    }
  })

  test("EulerEarnFactory creates Vault entity", () => {
    let earnAddress = Address.fromString("0x3333333333333333333333333333333333333333")
    let factoryAddress = Address.fromString("0x4444444444444444444444444444444444444444")

    let event = createEulerEarnEvent(earnAddress, factoryAddress)
    handleCreateEulerEarn(event)

    let vault = Vault.load(earnAddress)
    assert.assertNotNull(vault)
    if (vault) {
      assert.bytesEquals(vault.factory, factoryAddress)
    }
  })
})

