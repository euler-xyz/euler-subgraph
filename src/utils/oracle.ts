import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { EulerRouter } from "../../generated/templates/EVault/EulerRouter";
import { Oracle, Vault } from "../../generated/schema";

export function createOraclePrice(
  vault: Vault,
  blockNumber: BigInt,
  oracleAddress: Bytes,
  base: Bytes,
  quote: Bytes
): void {
  if (
    oracleAddress == Address.zero() ||
    base == Address.zero() ||
    quote == Address.zero()
  ) {
    // If one of them is 0 then we don't create pricing
    return;
  }
  let eulerRouter = EulerRouter.bind(Address.fromBytes(oracleAddress));
  let price = eulerRouter.try_getQuote(
    BigInt.fromString("1"),
    Address.fromBytes(base),
    Address.fromBytes(quote)
  );

  if (price.reverted) return;
  let oracle = new Oracle(
    vault.id.toHexString() +
      "-" +
      base.toHexString() +
      "-" +
      quote.toHexString() +
      "-" +
      blockNumber.toString()
  );

  oracle.value = price.value;
  oracle.oracle = oracleAddress;
  oracle.base = base;
  oracle.quote = quote;
  oracle.blockNumber = blockNumber;
  oracle.vault = vault.id;
  oracle.save();
  return;
}
