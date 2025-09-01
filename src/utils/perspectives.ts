import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Perspective } from "../../generated/EulerVaultFactory/Perspective"
import { Perspective as PerspectiveEntity } from "../../generated/schema"


export const PerspectiveType = ["edgeFactoryPerspective", "escrowedCollateralPerspective", "eulerEarnFactoryPerspective", "eulerEarnGovernedPerspective", "eulerUngoverned0xPerspective", "eulerUngovernedNzxPerspective", "evkFactoryPerspective", "governedPerspective"]

export function getPerspectiveId(perspectiveType: string): string {
    return perspectiveType
}

export function loadOrCreatePerspective(address: Bytes, perspectiveType: string): PerspectiveEntity {
    let id = getPerspectiveId(perspectiveType)
    let perspective = PerspectiveEntity.load(id)

    let perspectiveContract = Perspective.bind(Address.fromBytes(address))
    if (!perspective) {
        perspective = new PerspectiveEntity(id)
        perspective.name = perspectiveType
        perspective.perspectiveType = perspectiveType
        perspective.address = address
        let verifiedArray = perspectiveContract.try_verifiedArray()

        if (!verifiedArray.reverted) {
            let addrs = verifiedArray.value; // Address[]
            let bytesArr = new Array<Bytes>(addrs.length);

            for (let i = 0; i < addrs.length; i++) {
                // Safe ways to turn Address -> Bytes:
                // 1) cast:
                bytesArr[i] = changetype<Bytes>(addrs[i]);
                // 2) or via hex (also fine):
                // bytesArr[i] = Bytes.fromHexString(addrs[i].toHexString()) as Bytes;
            }
            perspective.verifiedVaults = bytesArr

        }

        perspective.blockNumber = BigInt.fromI32(0)
        perspective.blockTimestamp = BigInt.fromI32(0)
        perspective.transactionHash = Bytes.fromHexString("0x")
        perspective.save()
    }
    return perspective
}

function loadPerspective(perspectiveType: string): PerspectiveEntity | null {
    let id = getPerspectiveId(perspectiveType)
    let perspective = PerspectiveEntity.load(id)
    if (!perspective) {
        return null
    }
    return perspective
}

export function updatePerspective(address: Bytes, perspectiveType: string, blockNumber: BigInt, blockTimestamp: BigInt, transactionHash: Bytes): void {
    let perspective = loadOrCreatePerspective(address, perspectiveType)
    if (address == Address.zero()) {
        return
    }
    let perspectiveContract = Perspective.bind(Address.fromBytes(address))
    // we update the list
    let verifiedArray = perspectiveContract.try_verifiedArray()
    perspective.verifiedVaults = []
    if (!verifiedArray.reverted) {
        let addrs = verifiedArray.value; // Address[]
        let bytesArr = new Array<Bytes>(addrs.length);

        for (let i = 0; i < addrs.length; i++) {
            // Safe ways to turn Address -> Bytes:
            // 1) cast:
            bytesArr[i] = changetype<Bytes>(addrs[i]);
            // 2) or via hex (also fine):
            // bytesArr[i] = Bytes.fromHexString(addrs[i].toHexString()) as Bytes;
        }
        perspective.verifiedVaults = bytesArr
    }

    // We show last time we updated the perspective
    perspective.blockNumber = blockNumber
    perspective.blockTimestamp = blockTimestamp
    perspective.transactionHash = transactionHash
    perspective.save()
}


export function isVaultVerified(perspectiveType: string, vault: Bytes): boolean {
    let perspective = loadPerspective(perspectiveType)
    if (perspective == null) {
        return false
    }
    let verifiedVaults = perspective.verifiedVaults
    if (verifiedVaults == null || verifiedVaults.length == 0) {
        return false
    }
    for (let i = 0; i < verifiedVaults.length; i++) {
        if (verifiedVaults[i].toHexString() == vault.toHexString()) {
            return true
        }
    }
    return false
}


export function checkPerspectives(address: Bytes): string[] {
    let perspectives: string[] = []
    if (isVaultVerified("edgeFactoryPerspective", address)) {
        perspectives.push("edgeFactoryPerspective")
    }
    if (isVaultVerified("escrowedCollateralPerspective", address)) {
        perspectives.push("escrowedCollateralPerspective")
    }
    if (isVaultVerified("eulerEarnFactoryPerspective", address)) {
        perspectives.push("eulerEarnFactoryPerspective")
    }
    if (isVaultVerified("eulerEarnGovernedPerspective", address)) {
        perspectives.push("eulerEarnGovernedPerspective")
    }
    if (isVaultVerified("eulerUngoverned0xPerspective", address)) {
        perspectives.push("eulerUngoverned0xPerspective")
    }
    if (isVaultVerified("eulerUngovernedNzxPerspective", address)) {
        perspectives.push("eulerUngovernedNzxPerspective")
    }
    if (isVaultVerified("evkFactoryPerspective", address)) {
        perspectives.push("evkFactoryPerspective")
    }
    if (isVaultVerified("governedPerspective", address)) {
        perspectives.push("governedPerspective")
    }
    if (perspectives.length == 0) {
        perspectives.push("Unknown")
    }
    return perspectives
}