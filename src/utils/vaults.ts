import { Address, BigInt } from "@graphprotocol/graph-ts";
import { EVault } from "../../generated/templates/EVault/EVault";
import { ERC20 } from "../../generated/templates/EVault/ERC20";
import { Vault } from "../../generated/schema";
import { getVaultData } from "./lens";
import { createOraclePrice } from "./oracle";
import { BACKUP_UNITOFACCOUNT } from "./constants";

export function createOrUpdate(vaultAddress: Address): Vault {
  let vault = Vault.load(vaultAddress);
  // If not exist we create a new one
  if (!vault) {
    vault = new Vault(vaultAddress);
    vault.timestamp = BigInt.zero();
    vault.asset = Address.zero();
    vault.unitOfAccount = Address.zero();
    vault.oracle = Address.zero();
    vault.backupOracle = Address.zero();
    vault.id = vaultAddress;
    vault.vault = vaultAddress;
    // Save
    vault.save();
  }

  return vault;
}

function updateChangeValues(vault: Vault, vaultAddress: Address): void {
  let eVault = EVault.bind(vaultAddress);
  // Total shares
  vault.totalShares = eVault.totalSupply();
  vault.totalAssets = eVault.totalAssets();
  vault.totalCash = eVault.cash();
  vault.totalBorrowed = eVault.totalBorrows();

  vault.accumulatedFeesShares = eVault.accumulatedFees();
  vault.accumulatedFeesAssets = eVault.accumulatedFeesAssets();

  vault.save();
}

function updateByVaultContract(
  blockNumber: BigInt,
  vault: Vault,
  vaultAddress: Address
): void {
  let eVault = EVault.bind(vaultAddress);

  // If we already had information we only update few parameters
  if (vault.asset !== Address.zero()) {
    updateChangeValues(vault, vaultAddress);
    createOraclePrice(
      vault,
      blockNumber,
      vault.oracle,
      vault.asset,
      vault.unitOfAccount
    );
    return;
  }
  vault.timestamp = BigInt.zero();
  vault.vaultName = eVault.name();
  vault.vaultSymbol = eVault.symbol();
  vault.vaultDecimals = BigInt.fromI32(eVault.decimals());

  // ASSET
  let asset = eVault.asset();
  vault.asset = asset;
  if (asset !== null && asset !== Address.zero()) {
    let assetContract = ERC20.bind(asset);
    vault.assetName = assetContract.name();
    vault.assetSymbol = assetContract.symbol();
    vault.assetDecimals = BigInt.fromI32(assetContract.decimals());
  }

  // Unit of account
  let unitOfAccount = eVault.unitOfAccount();
  vault.unitOfAccount = unitOfAccount;
  if (unitOfAccount !== null && unitOfAccount !== Address.zero()) {
    let assetContract = ERC20.bind(unitOfAccount);
    vault.unitOfAccountName = assetContract.name();
    vault.unitOfAccountSymbol = assetContract.symbol();
    vault.unitOfAccountDecimals = BigInt.fromI32(assetContract.decimals());
  } else {
    vault.unitOfAccount = BACKUP_UNITOFACCOUNT;
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
  vault.backupOracle = Address.zero();
  vault.interestRateModel = eVault.interestRateModel();
  vault.evc = eVault.EVC();
  vault.protocolConfig = eVault.protocolConfigAddress();
  vault.balanceTracker = eVault.balanceTrackerAddress();
  vault.permit2 = eVault.permit2Address();

  vault.creator = eVault.creator();
  vault.governorAdmin = eVault.governorAdmin();

  vault.save();

  createOraclePrice(
    vault,
    blockNumber,
    vault.oracle,
    vault.asset,
    vault.unitOfAccount
  );
}

export function upsertVault(blockNumber: BigInt, vaultAddress: Address): void {
  let vault = createOrUpdate(vaultAddress);
  let vaultLens = getVaultData(blockNumber, vaultAddress);

  if (vaultLens == null) {
    // The contract was not deployed
    updateByVaultContract(blockNumber, vault, vaultAddress);
    return;
  }

  if (vault.timestamp === vaultLens.timestamp) {
    // If it's the same timestamp we don't update
    return;
  }
  // We only update few parameters

  if (vault.timestamp && vault.timestamp.gt(BigInt.zero())) {
    ///////////////////
    // UPDATE VAULT
    ///////////////////

    // SHARES
    vault.totalAssets = vaultLens.totalAssets;
    vault.totalShares = vaultLens.totalShares;
    vault.totalCash = vaultLens.totalCash;
    vault.totalBorrowed = vaultLens.totalBorrowed;
    vault.accumulatedFeesAssets = vaultLens.accumulatedFeesAssets;
    vault.accumulatedFeesShares = vaultLens.accumulatedFeesShares;
    vault.save();

    createOraclePrice(
      vault,
      blockNumber,
      vault.oracle === Address.zero() ? vault.backupOracle : vault.oracle,
      vault.asset,
      vault.unitOfAccount
    );
    return;
  }
  ///////////////////
  // NEW VAULT
  ///////////////////

  vault.timestamp = vaultLens.timestamp;
  // Vault
  vault.vault = vaultLens.vault;
  vault.vaultName = vaultLens.vaultName;
  vault.vaultSymbol = vaultLens.vaultSymbol;
  vault.vaultDecimals = vaultLens.vaultDecimals;
  // Asset
  vault.asset = vaultLens.asset;
  vault.assetName = vaultLens.assetName;
  vault.assetSymbol = vaultLens.assetSymbol;
  vault.assetDecimals = vaultLens.assetDecimals;

  // unitOfAccount
  if (vaultLens.unitOfAccount === Address.zero()) {
    vault.unitOfAccount = BACKUP_UNITOFACCOUNT;
  } else {
    vault.unitOfAccount = vaultLens.unitOfAccount;
  }
  vault.unitOfAccountName = vaultLens.unitOfAccountName;
  vault.unitOfAccountSymbol = vaultLens.unitOfAccountSymbol;
  vault.unitOfAccountDecimals = vaultLens.unitOfAccountDecimals;

  // SHARES
  vault.totalAssets = vaultLens.totalAssets;
  vault.totalShares = vaultLens.totalShares;
  vault.totalCash = vaultLens.totalCash;
  vault.totalBorrowed = vaultLens.totalBorrowed;

  // Fees
  vault.accumulatedFeesAssets = vaultLens.accumulatedFeesAssets;
  vault.accumulatedFeesShares = vaultLens.accumulatedFeesShares;
  vault.governorFeeReceiver = vaultLens.governorFeeReceiver;
  vault.protocolFeeReceiver = vaultLens.protocolFeeReceiver;
  vault.protocolFeeShare = vaultLens.protocolFeeShare;
  vault.interestFee = vaultLens.interestFee;
  vault.hookedOperations = vaultLens.hookedOperations;
  vault.configFlags = vaultLens.configFlags;
  vault.supplyCap = vaultLens.supplyCap;
  vault.borrowCap = vaultLens.borrowCap;
  vault.maxLiquidationDiscount = vaultLens.maxLiquidationDiscount;
  vault.liquidationCoolOffTime = vaultLens.liquidationCoolOffTime;
  vault.dToken = vaultLens.dToken;
  vault.oracle = vaultLens.oracle;
  vault.interestRateModel = vaultLens.interestRateModel;
  vault.hookTarget = vaultLens.hookTarget;
  vault.evc = vaultLens.evc;
  vault.protocolConfig = vaultLens.protocolConfig;
  vault.balanceTracker = vaultLens.balanceTracker;
  vault.permit2 = vaultLens.permit2;
  vault.creator = vaultLens.creator;
  vault.governorAdmin = vaultLens.governorAdmin;
  vault.backupOracle = vaultLens.backupAssetOracleInfo.oracle;
  vault.save();

  createOraclePrice(
    vault,
    blockNumber,
    vault.oracle === Address.zero() ? vault.backupOracle : vault.oracle,
    vault.asset,
    vault.unitOfAccount
  );
}
