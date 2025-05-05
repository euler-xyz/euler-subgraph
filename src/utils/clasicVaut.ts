import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { EulerVault } from "../../generated/schema";
import { EulerVault as EulerVaultContract } from "../../generated/templates/EulerVault/EulerVault";

export function loadOrCreateEulerVault(address: Bytes): EulerVault {
    let vault = EulerVault.load(address)
    if (!vault) {
        let vaultContract = EulerVaultContract.bind(Address.fromBytes(address))
        vault = new EulerVault(address)
        vault.evc = vaultContract.EVC()
        vault.name = vaultContract.name()
        vault.decimals = BigInt.fromI32(vaultContract.decimals())
        let caps = vaultContract.caps()
        vault.borrowCap = BigInt.fromI32(caps.value0)
        vault.supplyCap = BigInt.fromI32(caps.value1)
        vault.dToken = vaultContract.dToken()
        vault.evault = address
        vault.permit2Address = vaultContract.permit2Address()
        vault.interestRateModel = vaultContract.interestRateModel()
        vault.governonAdmin = vaultContract.governorAdmin()
        vault.feeReceiver = vaultContract.feeReceiver()
        vault.asset = vaultContract.asset()
        vault.oracle = vaultContract.oracle()
        vault.creator = vaultContract.creator()
        vault.symbol = vaultContract.symbol()
        vault.unitOfAccount = vaultContract.unitOfAccount()
        vault.blockNumber = BigInt.fromI32(0)
        vault.blockTimestamp = BigInt.fromI32(0)
        vault.transactionHash = Bytes.fromHexString("0x")
        vault.save()
    }
    return vault
}

