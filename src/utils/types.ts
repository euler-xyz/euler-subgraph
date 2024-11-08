import { BigInt, Bytes } from "@graphprotocol/graph-ts";

export class ResultQuotePrice {
  _quote: Bytes;
  _price: BigInt | null;

  constructor(quote: Bytes, price: BigInt | null) {
    this._quote = quote;
    this._price = price;
  }

  get quote(): Bytes {
    return this._quote;
  }

  get price(): BigInt | null {
    return this._price;
  }
}
