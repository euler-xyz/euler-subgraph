import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { EulerVault } from "../../generated/schema";
import { EulerVault as EulerVaultContract } from "../../generated/templates/EulerVault/EulerVault";
import { checkPerspectives } from "./perspectives";

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
        vault.perspectives = checkPerspectives(address)
        vault.collaterals = []

        let ltvList = vaultContract.try_LTVList()

        if (!ltvList.reverted) {
            let addrs = ltvList.value; // Address[]
            let bytesArr = new Array<Bytes>(addrs.length);

            for (let i = 0; i < addrs.length; i++) {
                // Safe ways to turn Address -> Bytes:
                // 1) cast:
                bytesArr[i] = changetype<Bytes>(addrs[i]);
                // 2) or via hex (also fine):
                // bytesArr[i] = Bytes.fromHexString(addrs[i].toHexString()) as Bytes;
            }
            vault.collaterals = bytesArr

        }

        vault.interestFee = BigInt.fromI32(vaultContract.interestFee())
        vault.save()
    }
    return vault
}

export function updateEulerVault(address: Bytes): void {
    let vault = loadOrCreateEulerVault(address)
    let vaultContract = EulerVaultContract.bind(Address.fromBytes(address))
    let caps = vaultContract.caps()
    vault.borrowCap = BigInt.fromI32(caps.value0)
    vault.supplyCap = BigInt.fromI32(caps.value1)
    vault.oracle = vaultContract.oracle()
    vault.interestRateModel = vaultContract.interestRateModel()
    vault.governonAdmin = vaultContract.governorAdmin()
    vault.feeReceiver = vaultContract.feeReceiver()
    vault.perspectives = checkPerspectives(address)
    vault.unitOfAccount = vaultContract.unitOfAccount()
    vault.interestFee = BigInt.fromI32(vaultContract.interestFee())
    vault.collaterals = []
    let ltvList = vaultContract.try_LTVList()

    if (!ltvList.reverted) {
        let addrs = ltvList.value; // Address[]
        let bytesArr = new Array<Bytes>(addrs.length);

        for (let i = 0; i < addrs.length; i++) {
            // Safe ways to turn Address -> Bytes:
            // 1) cast:
            bytesArr[i] = changetype<Bytes>(addrs[i]);
            // 2) or via hex (also fine):
            // bytesArr[i] = Bytes.fromHexString(addrs[i].toHexString()) as Bytes;
        }
        vault.collaterals = bytesArr

    }

    vault.save()
}



