import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { EulerEarnVault } from "../../generated/schema";
import { EulerEarn as EulerEarnVaultContract } from "../../generated/templates/EulerEarn/EulerEarn";

export function loadOrCreateEulerEarnVault(address: Bytes): EulerEarnVault {
    let vault = EulerEarnVault.load(address)
    if (!vault) {
        let vaultContract = EulerEarnVaultContract.bind(Address.fromBytes(address))
        vault = new EulerEarnVault(address)
        vault.evc = vaultContract.EVC()
        vault.name = vaultContract.name()
        vault.symbol = vaultContract.symbol()
        vault.permit2Address = vaultContract.permit2Address()
        vault.strategyModule = vaultContract.strategyModule()
        vault.owner = Address.zero()
        vault.asset = vaultContract.asset()
        vault.hooks = vaultContract.hooksModule()
        vault.totalAssets = vaultContract.totalAssets()
        vault.totalAllocated = BigInt.fromI32(0)
        vault.totalSupply = BigInt.fromI32(0)
        vault.name = vaultContract.name()
        vault.symbol = vaultContract.symbol()

        vault.blockNumber = BigInt.fromI32(0)
        vault.blockTimestamp = BigInt.fromI32(0)
        vault.transactionHash = Bytes.fromHexString("0x")

        vault.save()
    }
    return vault
}

export function updateEulerEarnVault(address: Bytes): void {
    let vault = loadOrCreateEulerEarnVault(address)
    let vaultContract = EulerEarnVaultContract.bind(Address.fromBytes(address))
    vault.totalAssets = vaultContract.totalAssets()
    vault.totalAllocated = vaultContract.totalAllocated()
    vault.totalSupply = vaultContract.totalSupply()
    vault.save()
}