import { Address, BigInt } from "@graphprotocol/graph-ts";
import { dataSource } from "@graphprotocol/graph-ts";

export function getVaultLensBlockNumber(): BigInt {
  let network = dataSource.network();
  if (network == "mainnet") {
    return BigInt.fromI32(20971247);
  } else if (network == "base") {
    return BigInt.fromI32(22713387);
  } else if (network == "arbitrum-one") {
    return BigInt.zero();
  }
  return BigInt.zero();
}

export function getVaultLensAddress(): Address {
  let network = dataSource.network();
  if (network == "mainnet") {
    return Address.fromString("0x6F544E6f6245aab0d73A7FC292727639b877ae55");
  } else if (network == "base") {
    return Address.fromString("0xd65aCf4AecD8F9F832126115e42C2e3eF1Cc90Ba");
  } else if (network == "arbitrum-one") {
    return Address.fromString("0x0000000000000000000000000000000000000000");
  }
  return Address.fromString("0x0000000000000000000000000000000000000000");
}

///////////////////////////
/// DEFAULT ASSETS
///////////////////////////

export function getUnitOfAccountUSDC(): Address {
  let network = dataSource.network();
  if (network == "mainnet") {
    return Address.fromString("0x0000000000000000000000000000000000000348");
  } else if (network == "base") {
    return Address.fromString("0x0000000000000000000000000000000000000348");
  } else if (network == "arbitrum-one") {
    return Address.fromString("0x0000000000000000000000000000000000000348");
  }
  return Address.fromString("0x0000000000000000000000000000000000000000");
}

export function getUnitOfAccountWETH(): Address {
  let network = dataSource.network();
  if (network == "mainnet") {
    return Address.fromString("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
  } else if (network == "base") {
    return Address.fromString("0x4200000000000000000000000000000000000006");
  } else if (network == "arbitrum-one") {
    return Address.fromString("0x4200000000000000000000000000000000000006");
  }
  return Address.fromString("0x0000000000000000000000000000000000000000");
}

export const BACKUP_UNITOFACCOUNT_ETH = Address.fromString(
  "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB" // ETH
);

export const BACKUP_UNITOFACCOUNT = [
  getUnitOfAccountUSDC(),
  getUnitOfAccountWETH(),
  BACKUP_UNITOFACCOUNT_ETH,
];

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
];
