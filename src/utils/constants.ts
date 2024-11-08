import { Address, BigInt } from "@graphprotocol/graph-ts";

// Deployed on block 20971247
export const VAULT_LENS_BLOCK = BigInt.fromI32(20971247);
export const VAULT_LENS = Address.fromString(
  "0x0Dd643580a1B137DB748651A6a9be13Ba5734Fd8"
);
export const BACKUP_UNITOFACCOUNT = Address.fromString(
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" // WETH
);

export const BACKUP_UNITOFACCOUNT_ETH = Address.fromString(
  "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB" // WETH
);
