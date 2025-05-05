import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { EulerEarnVault } from "../../generated/schema";
import { EulerEarn as EulerEarnVaultContract } from "../../generated/templates/EulerEarn/EulerEarn";

export function loadOrCreateEulerVault(address: Bytes): EulerEarnVault {
    let vault = EulerEarnVault.load(address)
    if (!vault) {
        let vaultContract = EulerEarnVaultContract.bind(Address.fromBytes(address))
        vault = new EulerEarnVault(address)
        vault.asset = vaultContract.asset()
        vault.totalAssets = vaultContract.totalAssets()

        vault.save()
    }
    return vault
}

