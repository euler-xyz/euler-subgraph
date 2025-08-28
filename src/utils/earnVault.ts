import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { EulerEarnVault, Strategy } from "../../generated/schema";
import { EulerEarn as EulerEarnVaultContract } from "../../generated/templates/EulerEarn/EulerEarn";
import { checkPerspectives } from "./perspectives";

export function loadOrCreateEulerEarnVault(address: Bytes): EulerEarnVault {
    let vault = EulerEarnVault.load(address)
    if (!vault) {
        let vaultContract = EulerEarnVaultContract.bind(Address.fromBytes(address))
        vault = new EulerEarnVault(address)
        vault.evc = vaultContract.EVC()
        vault.name = vaultContract.name()
        vault.symbol = vaultContract.symbol()
        vault.performanceFee = vaultContract.fee()
        vault.asset = vaultContract.asset()
        // TIMELOCKS
        vault.timelock = vaultContract.timelock()
        let pendingTimelock = vaultContract.pendingTimelock()
        let pendingGuardian = vaultContract.pendingGuardian()
        vault.pendingTimelock = pendingTimelock.getValue()
        vault.pendingTimelockValidAt = pendingTimelock.getValidAt()
        vault.pendingGuardian = pendingGuardian.getValue()
        vault.pendingGuardianValidAt = pendingGuardian.getValidAt()
        // LISTS

        let totalSupplyQueue = vaultContract.supplyQueueLength().toI32()
        let queue = new Array<Bytes>(totalSupplyQueue)
        for (let i = 0; i < totalSupplyQueue; i++) {
            let supply = vaultContract.supplyQueue(BigInt.fromI32(i))
            queue[i] = changetype<Bytes>(supply);
        }
        vault.supplyQueue = queue

        let totalStrategies = vaultContract.withdrawQueueLength().toI32()
        let strategies = new Array<Bytes>(totalStrategies)
        for (let i = 0; i < totalStrategies; i++) {
            let strategyAddress = vaultContract.withdrawQueue(BigInt.fromI32(i))
            let strategy = updateStrategyStats(address, changetype<Bytes>(strategyAddress))
            strategies[i] = strategy.id;
        }
        vault.strategies = strategies

        // USERS
        vault.owner = vaultContract.owner()
        vault.creator = vaultContract.creator()
        vault.curator = vaultContract.curator()
        vault.guardian = vaultContract.guardian()
        vault.feeReceiver = vaultContract.feeRecipient()


        vault.perspectives = checkPerspectives(address)

        vault.totalShares = vaultContract.totalSupply()
        vault.totalAssets = BigInt.fromI32(0)
        vault.totalLostAssets = BigInt.fromI32(0)
        vault.totalAllocated = BigInt.fromI32(0) // Default value since totalAllocated() doesn't exist
        vault.totalSupply = BigInt.fromI32(0)

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

    vault.owner = vaultContract.owner()
    vault.curator = vaultContract.curator()
    vault.guardian = vaultContract.guardian()
    vault.creator = vaultContract.creator()
    vault.asset = vaultContract.asset()
    vault.feeReceiver = vaultContract.feeRecipient()
    vault.perspectives = checkPerspectives(address)
    vault.totalAssets = vaultContract.totalAssets()
    vault.totalLostAssets = vaultContract.lostAssets()
    vault.totalShares = vaultContract.totalSupply()
    vault.totalSupply = vaultContract.totalSupply()
    vault.totalAssets = vaultContract.totalAssets()
    vault.performanceFee = vaultContract.fee()
    vault.timelock = vaultContract.timelock()
    let pendingTimelock = vaultContract.pendingTimelock()
    let pendingGuardian = vaultContract.pendingGuardian()
    vault.pendingTimelock = pendingTimelock.getValue()
    vault.pendingTimelockValidAt = pendingTimelock.getValidAt()
    vault.pendingGuardian = pendingGuardian.getValue()
    vault.pendingGuardianValidAt = pendingGuardian.getValidAt()
    vault.save()
}
export function updateStrategyStats(eulerVault: Bytes, address: Bytes): Strategy {
    let strategy = Strategy.load(eulerVault.concat(address))
    let vaultContract = EulerEarnVaultContract.bind(Address.fromBytes(eulerVault))
    let config = vaultContract.config(Address.fromBytes(address));
    let pendingConfig = vaultContract.pendingCap(Address.fromBytes(address));
    if (!strategy) {
        strategy = new Strategy(eulerVault.concat(address))
    }
    strategy.strategy = address
    strategy.allocatedAssets = vaultContract.expectedSupplyAssets(Address.fromBytes(address))
    strategy.availableAssets = vaultContract.maxWithdrawFromStrategy(Address.fromBytes(address))
    strategy.currentAllocationCap = config.getCap()
    strategy.pendingAllocationCap = pendingConfig.getValue()
    strategy.pendingAllocationCapValidAt = pendingConfig.getValidAt()
    strategy.removableAt = config.getRemovableAt()
    strategy.eulerVault = eulerVault
    strategy.save()
    return strategy
}


export function updateEulerEarnVaultStats(address: Bytes): void {
    let vault = loadOrCreateEulerEarnVault(address)
    let vaultContract = EulerEarnVaultContract.bind(Address.fromBytes(address))
    vault.totalAssets = vaultContract.totalAssets()
    vault.totalLostAssets = vaultContract.lostAssets()
    vault.totalShares = vaultContract.totalSupply()
    vault.totalSupply = vaultContract.totalSupply()
    vault.totalAssets = vaultContract.totalAssets()
    vault.timelock = vaultContract.timelock()
    vault.performanceFee = vaultContract.fee()
    vault.timelock = vaultContract.timelock()
    let pendingTimelock = vaultContract.pendingTimelock()
    let pendingGuardian = vaultContract.pendingGuardian()
    vault.pendingTimelock = pendingTimelock.getValue()
    vault.pendingTimelockValidAt = pendingTimelock.getValidAt()
    vault.pendingGuardian = pendingGuardian.getValue()
    vault.pendingGuardianValidAt = pendingGuardian.getValidAt()

    // LISTS

    let totalSupplyQueue = vaultContract.supplyQueueLength().toI32()
    let queue = new Array<Bytes>(totalSupplyQueue)
    for (let i = 0; i < totalSupplyQueue; i++) {
        let supply = vaultContract.supplyQueue(BigInt.fromI32(i))
        queue[i] = changetype<Bytes>(supply);
    }
    vault.supplyQueue = queue

    let totalStrategies = vaultContract.withdrawQueueLength().toI32()
    let strategies = new Array<Bytes>(totalStrategies)
    for (let i = 0; i < totalStrategies; i++) {
        let strategyAddress = vaultContract.withdrawQueue(BigInt.fromI32(i))
        let strategy = updateStrategyStats(address, changetype<Bytes>(strategyAddress))
        strategies[i] = strategy.id;
    }
    vault.strategies = strategies

    vault.perspectives = checkPerspectives(address)
    vault.save()
}