import { BigInt, log } from "@graphprotocol/graph-ts"

const ONE = BigInt.fromString("1000000000000000000000000000") // 1e27 (RAY)
const SECONDS_PER_YEAR = BigInt.fromI32(31556952) //  365.2425 * 86400;
const CONFIG_SCALE = BigInt.fromI32(10000)

// Implement rpow function for AssemblyScript
function rpow(x: BigInt, n: BigInt): BigInt {
    // Handle base cases
    if (n.equals(BigInt.zero())) {
        return ONE
    }
    if (x.equals(BigInt.zero())) {
        return BigInt.zero()
    }
    if (x.equals(ONE)) {
        return ONE
    }

    // For very large n, use approximation to avoid overflow
    if (n.gt(BigInt.fromI32(100000000))) {
        // For (1 + small_rate)^large_n, use exp approximation
        // (1 + r)^n ≈ e^(n*ln(1+r)) ≈ e^(n*r) for small r
        let rate = x.minus(ONE)
        let product = rate.times(n)
        // Simple approximation: e^x ≈ 1 + x for small x
        return ONE.plus(product)
    }

    // Binary exponentiation with proper scaling
    let z = ONE
    let base = x
    let exp = n

    while (exp.gt(BigInt.zero())) {
        if (exp.mod(BigInt.fromI32(2)).equals(BigInt.fromI32(1))) {
            // z = z * base / ONE (maintaining RAY precision)
            z = z.times(base).div(ONE)
        }
        // base = base * base / ONE (maintaining RAY precision)  
        base = base.times(base).div(ONE)
        exp = exp.div(BigInt.fromI32(2))
    }

    return z
}

// We support with 0.1% difference of issue with the APYs that is comming from the contracts
export function computeAPYs(
    borrowSPY: BigInt,
    cash: BigInt,
    borrows: BigInt,
    interestFee: BigInt
): BigInt[] {
    const totalAssets = cash.plus(borrows)


    // Calculate RPow.rpow(borrowSPY + ONE, SECONDS_PER_YEAR, ONE) result
    // Expected result: 1000031180432684936946622361
    // let borrowAPY = BigInt.fromString("1000031180432684936946622361")
    let borrowAPYRaw = rpow(borrowSPY.plus(ONE), SECONDS_PER_YEAR)

    // borrowAPY -= ONE;
    let borrowAPYUnscaled = borrowAPYRaw.minus(ONE)

    // For supply APY calculation, use unscaled borrowAPY
    let scaledInterestFee = CONFIG_SCALE.minus(interestFee)
    // supplyAPY = totalAssets == 0 ? 0 : borrowAPY * borrows * (CONFIG_SCALE - interestFee) / totalAssets / CONFIG_SCALE;
    if (totalAssets.equals(BigInt.zero())) {
        // Scale down the borrow APY for return value
        return [borrowAPYUnscaled, BigInt.zero()]
    }

    let supplyAPYStep1 = borrowAPYUnscaled
        .times(borrows)
        .times(scaledInterestFee)
    let supplyAPYStep2 = supplyAPYStep1.div(totalAssets)
    let supplyAPYUnscaled = supplyAPYStep2.div(CONFIG_SCALE)



    return [borrowAPYUnscaled, supplyAPYUnscaled]
}

