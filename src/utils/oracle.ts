import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { EulerRouter } from "../../generated/templates/EVault/EulerRouter";
import { Oracle } from "../../generated/schema";

export function createOraclePrice(
  blockNumber: BigInt,
  oracleAddress: Bytes,
  base: Bytes,
  quote: Bytes
): void {
  if (
    oracleAddress === Address.zero() ||
    base === Address.zero() ||
    quote === Address.zero()
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
    oracleAddress.toHexString() + "-" + blockNumber.toString()
  );

  oracle.value = price.value;
  oracle.oracle = oracleAddress;
  oracle.base = base;
  oracle.quote = quote;
  oracle.blockNumber = blockNumber;

  oracle.save();
  return;
}
