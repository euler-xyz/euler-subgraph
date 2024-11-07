import { Address, BigInt } from "@graphprotocol/graph-ts";
import { VaultLens } from "../../generated/templates/EVault/VaultLens";
import { EVault } from "../../generated/templates/EVault/EVault";
import { Vault } from "../../generated/schema";

// CONSTANT
// Network 1 (Mainnet)
const VAULT_LENS = Address.fromString(
  "0x0Dd643580a1B137DB748651A6a9be13Ba5734Fd8"
);

export function createOrUpdate(vaultAddress: Address): Vault {
  let vault = Vault.load(vaultAddress);
  // If not exist we create a new one
  if (!vault) {
    vault = new Vault(vaultAddress);
    vault.id = vaultAddress;
    vault.vault = vaultAddress;
    // Save
    vault.save();
  }

  return vault;
}

function updateByVaultContract(vault: Vault, vaultAddress: Address): void {
  let eVault = EVault.bind(vaultAddress);

  vault.vaultName = eVault.name();
  vault.vaultSymbol = eVault.symbol();
  vault.vaultDecimals = BigInt.fromI32(eVault.decimals());

  // ASSET
  let asset = eVault.asset();
  vault.asset = asset;
  if (asset !== null && asset !== Address.zero()) {
    // let assetVault = EVault.bind(asset);
    // vault.assetName = assetVault.name();
    // vault.assetSymbol = assetVault.symbol();
    // vault.assetDecimals = BigInt.fromI32(assetVault.decimals());
  }

  // Unit of account
  let unitOfAccount = eVault.unitOfAccount();
  vault.unitOfAccount = unitOfAccount;
  if (unitOfAccount !== null && unitOfAccount !== Address.zero()) {
    //  vault.unitOfAccountDecimals
    //  vault.unitOfAccountName
    //  vault.unitOfAccountSymbol
  }

  // Total shares
  vault.totalShares = eVault.totalSupply();
  vault.totalAssets = eVault.totalAssets();
  vault.totalCash = eVault.cash();
  vault.totalBorrowed = eVault.totalBorrows();

  vault.accumulatedFeesShares = eVault.accumulatedFees();
  vault.accumulatedFeesAssets = eVault.accumulatedFeesAssets();

  vault.governorFeeReceiver = eVault.feeReceiver();
  vault.protocolFeeReceiver = eVault.protocolFeeReceiver();
  vault.protocolFeeShare = eVault.protocolFeeShare();
  vault.interestFee = BigInt.fromI32(eVault.interestFee());
  vault.configFlags = eVault.configFlags();
  //
  vault.maxLiquidationDiscount = BigInt.fromI32(
    eVault.maxLiquidationDiscount()
  );
  vault.liquidationCoolOffTime = BigInt.fromI32(
    eVault.liquidationCoolOffTime()
  );
  let caps = eVault.caps();
  vault.supplyCap = BigInt.fromI32(caps.value0);
  vault.borrowCap = BigInt.fromI32(caps.value1);

  vault.dToken = eVault.dToken();
  vault.oracle = eVault.oracle();
  vault.interestRateModel = eVault.interestRateModel();
  vault.evc = eVault.EVC();
  vault.protocolConfig = eVault.protocolConfigAddress();
  vault.balanceTracker = eVault.balanceTrackerAddress();
  vault.permit2 = eVault.permit2Address();

  vault.creator = eVault.creator();
  vault.governorAdmin = eVault.governorAdmin();

  vault.save();
}

export function upsertVault(vaultAddress: Address): void {
  const vaultLens = VaultLens.bind(VAULT_LENS);
  let vault = createOrUpdate(vaultAddress);

  const vaultInfo = vaultLens.try_getVaultInfoFull(vaultAddress);
  if (vaultInfo.reverted) {
    updateByVaultContract(vault, vaultAddress);
    return;
  }

  vault.timestamp = vaultInfo.value.timestamp;
  // Vault
  vault.vault = vaultInfo.value.vault;
  vault.vaultName = vaultInfo.value.vaultName;
  vault.vaultSymbol = vaultInfo.value.vaultSymbol;
  vault.vaultDecimals = vaultInfo.value.vaultDecimals;
  // Asset
  vault.asset = vaultInfo.value.asset;
  vault.assetName = vaultInfo.value.assetName;
  vault.assetSymbol = vaultInfo.value.assetSymbol;
  vault.assetDecimals = vaultInfo.value.assetDecimals;
  vault.totalAssets = vaultInfo.value.totalAssets;
  // unitOfAccount
  vault.unitOfAccount = vaultInfo.value.unitOfAccount;
  vault.unitOfAccountName = vaultInfo.value.unitOfAccountName;
  vault.unitOfAccountSymbol = vaultInfo.value.unitOfAccountSymbol;
  vault.unitOfAccountDecimals = vaultInfo.value.unitOfAccountDecimals;

  // SHARES
  vault.totalShares = vaultInfo.value.totalShares;
  vault.totalCash = vaultInfo.value.totalCash;
  vault.totalBorrowed = vaultInfo.value.totalBorrowed;

  // Fees
  vault.accumulatedFeesAssets = vaultInfo.value.accumulatedFeesAssets;
  vault.accumulatedFeesShares = vaultInfo.value.accumulatedFeesShares;
  vault.governorFeeReceiver = vaultInfo.value.governorFeeReceiver;
  vault.protocolFeeReceiver = vaultInfo.value.protocolFeeReceiver;
  vault.protocolFeeShare = vaultInfo.value.protocolFeeShare;
  vault.interestFee = vaultInfo.value.interestFee;
  vault.hookedOperations = vaultInfo.value.hookedOperations;
  vault.configFlags = vaultInfo.value.configFlags;
  vault.supplyCap = vaultInfo.value.supplyCap;
  vault.borrowCap = vaultInfo.value.borrowCap;
  vault.maxLiquidationDiscount = vaultInfo.value.maxLiquidationDiscount;
  vault.liquidationCoolOffTime = vaultInfo.value.liquidationCoolOffTime;
  vault.dToken = vaultInfo.value.dToken;
  vault.oracle = vaultInfo.value.oracle;
  vault.interestRateModel = vaultInfo.value.interestRateModel;
  vault.hookTarget = vaultInfo.value.hookTarget;
  vault.evc = vaultInfo.value.evc;
  vault.protocolConfig = vaultInfo.value.protocolConfig;
  vault.balanceTracker = vaultInfo.value.balanceTracker;
  vault.permit2 = vaultInfo.value.permit2;
  vault.creator = vaultInfo.value.creator;
  vault.governorAdmin = vaultInfo.value.governorAdmin;

  vault.save();
}
