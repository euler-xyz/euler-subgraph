import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  VaultLens,
  VaultLens__getVaultInfoFullResultValue0Struct,
} from "../../generated/templates/EVault/VaultLens";
import { getVaultLensBlockNumber, getVaultLensAddress } from "./constants";

export function getVaultLens(blockNumber: BigInt): VaultLens | null {
  if (blockNumber < getVaultLensBlockNumber()) {
    return null;
  }
  return VaultLens.bind(getVaultLensAddress());
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
