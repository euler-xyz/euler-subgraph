import { BigInt, log } from "@graphprotocol/graph-ts"
import { assert, describe, test } from "matchstick-as/assembly/index"
import { computeAPYs } from "../src/utils/math"

describe("Classic Vault APY Calculations", () => {


    test("First production scenario test", () => {

        const interestRate = BigInt.fromString("96504733090660608")
        const cash = BigInt.fromString("22414817689")
        const totalBorrows = BigInt.fromString("7881649028")
        const interestFee = BigInt.fromI32(1000) // 0.1%

        const borrowAPYExpected = BigInt.fromString("3050037156791948919011381")
        const supplyAPYExpected = BigInt.fromString("714122552806916907523706")

        const result = computeAPYs(interestRate, cash, totalBorrows, interestFee)
        const borrowAPY = result[0]
        const supplyAPY = result[1]

        log.info("First scenario - Actual borrow APY: {}", [borrowAPY.toString()])
        log.info("First scenario - Expected borrow APY: {}", [borrowAPYExpected.toString()])

        // Allow for a margin of error (1%) due to complex fixed-point arithmetic differences

        const borrowDiff = borrowAPY.minus(borrowAPYExpected).abs()
        const maxDiff = borrowAPYExpected.div(BigInt.fromI32(1000)) // 0.1% tolerance

        log.info("Borrow APY difference: {}, Max allowed difference: {}", [borrowDiff.toString(), maxDiff.toString()])
        assert.assertTrue(borrowDiff.le(maxDiff), "Borrow APY should be within 0.1% of expected value")


        const supplyDiff = supplyAPY.minus(supplyAPYExpected).abs()
        const maxSupplyDiff = supplyAPYExpected.div(BigInt.fromI32(1000)) // 0.1% tolerance

        log.info("Supply APY difference: {}, Max allowed difference: {}", [supplyDiff.toString(), maxSupplyDiff.toString()])
        assert.assertTrue(supplyDiff.le(maxSupplyDiff), "Supply APY should be within 0.1% of expected value")
    })


    test("Second production scenario test", () => {

        const interestRate = BigInt.fromString("975760017899816292")
        const cash = BigInt.fromString("2264810288486197083304")
        const totalBorrows = BigInt.fromString("2977805550482369461160")
        const interestFee = BigInt.fromI32(1000) // 0.1%

        const borrowAPYExpected = BigInt.fromString("31270989622917641944082001")
        const supplyAPYExpected = BigInt.fromString("15985728574357810255313818")

        const result = computeAPYs(interestRate, cash, totalBorrows, interestFee)
        const borrowAPY = result[0]
        const supplyAPY = result[1]

        log.info("Second scenario - Actual borrow APY: {}", [borrowAPY.toString()])
        log.info("Second scenario - Expected borrow APY: {}", [borrowAPYExpected.toString()])

        // Allow for a margin of error (1%) due to complex fixed-point arithmetic differences

        const borrowDiff = borrowAPY.minus(borrowAPYExpected).abs()
        const maxDiff = borrowAPYExpected.div(BigInt.fromI32(1000)) // 0.1% tolerance

        log.info("Borrow APY difference: {}, Max allowed difference: {}", [borrowDiff.toString(), maxDiff.toString()])
        assert.assertTrue(borrowDiff.le(maxDiff), "Borrow APY should be within 0.1% of expected value")


        const supplyDiff = supplyAPY.minus(supplyAPYExpected).abs()
        const maxSupplyDiff = supplyAPYExpected.div(BigInt.fromI32(1000)) // 0.1% tolerance

        log.info("Supply APY difference: {}, Max allowed difference: {}", [supplyDiff.toString(), maxSupplyDiff.toString()])
        assert.assertTrue(supplyDiff.le(maxSupplyDiff), "Supply APY should be within 0.1% of expected value")
    })
})