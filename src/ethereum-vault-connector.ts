import { CallWithContext as CallWithContextEvent } from "../generated/EthereumVaultConnector/EthereumVaultConnector";
import { EVAULT_SELECTORS } from "./utils/constants";
import { VaultByAccount, AccountVaults } from "../generated/schema";
import { Bytes } from "@graphprotocol/graph-ts";

function updateAccount(address: string, contractAddress: Bytes): void {
  const accountPrefix = address.substring(0, 40);
  const id = Bytes.fromHexString(accountPrefix);
  let account = AccountVaults.load(id);
  if (!account) {
    account = new AccountVaults(id);
    account.accountPrefix = id;
  }
  account.save();

  let vault = VaultByAccount.load(id.concat(contractAddress));
  if (!vault) {
    vault = new VaultByAccount(id.concat(contractAddress));
    vault.account = account.id;
    vault.vault = contractAddress;
    vault.save();
  }
}
export function handleCallWithContext(event: CallWithContextEvent): void {
  const isSelector = !!EVAULT_SELECTORS.includes(
    event.params.selector.toHexString().slice(0, 10).toLowerCase()
  );
  if (isSelector) {
    const from = event.transaction.from.toHexString();
    const address = event.params.onBehalfOfAddressPrefix
      .toHexString()
      .toLowerCase();
    const fromAddress = from.substring(0, 40).toLowerCase();
    updateAccount(address, event.params.targetContract);
    updateAccount(fromAddress, event.params.targetContract);
  }
}
