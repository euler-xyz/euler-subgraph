import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { EulerRouter } from "../../generated/templates/EVault/EulerRouter";
import { Oracle, Vault } from "../../generated/schema";
import { BACKUP_UNITOFACCOUNT, BACKUP_UNITOFACCOUNT_WETH } from "./constants";
import { ERC20 } from "../../generated/templates/EVault/ERC20";
import { ResultQuotePrice } from "./types";

function findValidBackup(
  oracleAddress: Bytes,
  base: Bytes,
  quote: Bytes
): ResultQuotePrice {
  let eulerRouter = EulerRouter.bind(Address.fromBytes(oracleAddress));

  if (quote.equals(Address.zero())) {
    for (let i = 0; i < BACKUP_UNITOFACCOUNT.length; i++) {
      const posibleUnitOfAccount = BACKUP_UNITOFACCOUNT[i];
      let price = eulerRouter.try_getQuote(
        BigInt.fromString("1"),
        Address.fromBytes(base),
        Address.fromBytes(posibleUnitOfAccount)
      );

      if (price.reverted) continue;
      return new ResultQuotePrice(posibleUnitOfAccount, price.value);
    }
    // By default WETH
    return new ResultQuotePrice(BACKUP_UNITOFACCOUNT_WETH, null);
  }
  let price = eulerRouter.try_getQuote(
    BigInt.fromString("1"),
    Address.fromBytes(base),
    Address.fromBytes(quote)
  );
  if (price.reverted) {
    return new ResultQuotePrice(quote, null);
  }
  return new ResultQuotePrice(quote, price.value);
}

export function createOraclePrice(
  vault: Vault,
  blockNumber: BigInt,
  oracleAddress: Bytes,
  base: Bytes,
  quote: Bytes
): void {
  if (oracleAddress.equals(Address.zero()) || base.equals(Address.zero())) {
    // If one of them is 0 then we don't create pricing
    return;
  }

  let result = findValidBackup(oracleAddress, base, quote);

  if (quote.notEqual(result.quote)) {
    // If quote is diferent we update unit of account
    vault.unitOfAccount = result.quote;
    let assetContract = ERC20.bind(Address.fromBytes(result.quote));
    let name = assetContract.try_name();
    if (!name.reverted) vault.unitOfAccountName = name.value;
    let symbol = assetContract.try_symbol();
    if (!symbol.reverted) vault.unitOfAccountSymbol = symbol.value;
    let decimals = assetContract.try_decimals();
    if (!decimals.reverted)
      vault.unitOfAccountDecimals = BigInt.fromI32(decimals.value);
    vault.save();
  }

  if (result.price === null) return;

  let oracle = new Oracle(
    vault.id.toHexString() +
      "-" +
      base.toHexString() +
      "-" +
      quote.toHexString() +
      "-" +
      blockNumber.toString()
  );
  oracle.value = result.price as BigInt; // We cast because of the return
  oracle.oracle = oracleAddress;
  oracle.base = base;
  oracle.quote = quote;
  oracle.blockNumber = blockNumber;
  oracle.vault = vault.id;
  oracle.save();
}
