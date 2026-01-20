import { Address, Bytes } from "@graphprotocol/graph-ts"
import { Vault } from "../../generated/schema"

export function registerVault(vaultAddress: Address, factoryAddress: Address): void {
  let vault = new Vault(vaultAddress)
  vault.factory = factoryAddress
  vault.save()
}

