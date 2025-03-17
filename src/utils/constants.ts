

export const EVAULT_SELECTORS = [
  "0xa9059cbb",
  "0x23b872dd",
  "0xcbfdd7e1",
  "0x6e553f65",
  "0x94bf804d",
  "0xb460af94",
  "0xba087652",
  "0x8d56c639",
  "0x4b3fd148",
  "0xacb70815",
  "0xa9c8eb7e",
  "0xaebde56b",
  "0xa55526db",
  "0xc1342574",
  "0x2b5335c3",
  "0x2b67b570",
]

export const TRANSFER_SELECTOR = "0xa9059cbb"
export const TRANSFER_FROM_SELECTOR = "0x23b872dd"
export const TRANSFER_FROM_MAX_SELECTOR = "0xcbfdd7e1"

export const DEPOSIT_SELECTOR = "0x6e553f65"
export const DEPOSIT_PERMIT_SELECTOR = "0x2b67b570"
export const MINT_SELECTOR = "0x94bf804d"
export const WITHDRAW_SELECTOR = "0xb460af94"
export const REDEEM_SELECTOR = "0xba087652"
export const SKIM_SELECTOR = "0x8d56c639"
export const BORROW_SELECTOR = "0x4b3fd148"
export const REPAY_SELECTOR = "0xacb70815"
export const REPAY_WITH_SHARES_SELECTOR = "0xa9c8eb7e"
export const PULL_DEBT_SELECTOR = "0xaebde56b"
export const TOUCH_SELECTOR = "0xa55526db"
export const LIQUIDATE_SELECTOR = "0xc1342574"
export const CONVERT_FEES_SELECTOR = "0x2b5335c3"

/*
export const EVAULT_SELECTORS = new Map<Hex, string>([
  ["0xa9059cbb", "transfer"],
  ["0x23b872dd", "transferFrom"],
  ["0xcbfdd7e1", "transferFromMax"],
  ["0x6e553f65", "deposit"],
  ["0x94bf804d", "mint"],
  ["0xb460af94", "withdraw"],
  ["0xba087652", "redeem"],
  ["0x8d56c639", "skim"],
  ["0x4b3fd148", "borrow"],
  ["0xacb70815", "repay"],
  ["0xa9c8eb7e", "repayWithShares"],
  ["0xaebde56b", "pullDebt"],
  ["0xa55526db", "touch"],
  ["0xc1342574", "liquidate"],
  ["0x2b5335c3", "convertFees"],
])

*/