// CONSTANT
// Network 1 (Mainnet)

import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  VaultLens,
  VaultLens__getVaultInfoFullResultValue0Struct,
} from "../../generated/templates/EVault/VaultLens";

// Deployed on block 20971247
const VAULT_LENS_BLOCK = BigInt.fromI32(20971247);
const VAULT_LENS = Address.fromString(
  "0x0Dd643580a1B137DB748651A6a9be13Ba5734Fd8"
);

export function getVaultLens(blockNumber: BigInt): VaultLens | null {
  if (blockNumber < VAULT_LENS_BLOCK) {
    return null;
  }
  return VaultLens.bind(VAULT_LENS);
}

export function getVaultData(
  blockNumber: BigInt,
  vaultAddress: Address
): VaultLens__getVaultInfoFullResultValue0Struct | null {
  let vaultLens = getVaultLens(blockNumber);
  if (!vaultLens) return null;

  // We always try to upload the value with the getVaultInfoFull
  const vaultInfo = vaultLens.try_getVaultInfoFull(vaultAddress);
  if (vaultInfo.reverted) {
    // on error we return null
    return null;
  }

  return vaultInfo.value;
}
