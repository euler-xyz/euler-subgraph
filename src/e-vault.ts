import {
  Approval,
  BalanceForwarderStatus,
  Borrow,
  ConvertFees,
  DebtSocialized,
  Deposit,
  EVaultCreated,
  GovSetCaps,
  GovSetConfigFlags,
  GovSetFeeReceiver,
  GovSetGovernorAdmin,
  GovSetHookConfig,
  GovSetInterestFee,
  GovSetInterestRateModel,
  GovSetLTV,
  GovSetLiquidationCoolOffTime,
  GovSetMaxLiquidationDiscount,
  InterestAccrued,
  Liquidate,
  PullDebt,
  Repay,
  Transfer,
  VaultStatus,
  Withdraw,
} from "../generated/schema";
import {
  Approval as ApprovalEvent,
  BalanceForwarderStatus as BalanceForwarderStatusEvent,
  Borrow as BorrowEvent,
  ConvertFees as ConvertFeesEvent,
  DebtSocialized as DebtSocializedEvent,
  Deposit as DepositEvent,
  EVaultCreated as EVaultCreatedEvent,
  GovSetCaps as GovSetCapsEvent,
  GovSetConfigFlags as GovSetConfigFlagsEvent,
  GovSetFeeReceiver as GovSetFeeReceiverEvent,
  GovSetGovernorAdmin as GovSetGovernorAdminEvent,
  GovSetHookConfig as GovSetHookConfigEvent,
  GovSetInterestFee as GovSetInterestFeeEvent,
  GovSetInterestRateModel as GovSetInterestRateModelEvent,
  GovSetLTV as GovSetLTVEvent,
  GovSetLiquidationCoolOffTime as GovSetLiquidationCoolOffTimeEvent,
  GovSetMaxLiquidationDiscount as GovSetMaxLiquidationDiscountEvent,
  InterestAccrued as InterestAccruedEvent,
  Liquidate as LiquidateEvent,
  PullDebt as PullDebtEvent,
  Repay as RepayEvent,
  Transfer as TransferEvent,
  VaultStatus as VaultStatusEvent,
  Withdraw as WithdrawEvent,
} from "../generated/templates/EVault/EVault";
import { increaseCounter } from "./utils/counter";
import { upsertVault } from "./utils/vaults";

export function handleApproval(event: ApprovalEvent): void {
  const entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.owner = event.params.owner;
  entity.spender = event.params.spender;
  entity.value = event.params.value;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  increaseCounter(
    "approval",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash
  );

  entity.save();

  upsertVault(event.block.number, event.address);
}

export function handleBalanceForwarderStatus(
  event: BalanceForwarderStatusEvent
): void {
  const entity = new BalanceForwarderStatus(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.account = event.params.account;
  entity.status = event.params.status;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  increaseCounter(
    "balanceForwarder",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash
  );

  entity.save();

  upsertVault(event.block.number, event.address);
}

export function handleBorrow(event: BorrowEvent): void {
  const entity = new Borrow(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.account = event.params.account;
  entity.assets = event.params.assets;
  entity.vault = event.address;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  increaseCounter(
    "borrow",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash
  );
  entity.save();

  upsertVault(event.block.number, event.address);
}

export function handleConvertFees(event: ConvertFeesEvent): void {
  const entity = new ConvertFees(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.sender = event.params.sender;
  entity.protocolReceiver = event.params.protocolReceiver;
  entity.governorReceiver = event.params.governorReceiver;
  entity.protocolShares = event.params.protocolShares;
  entity.governorShares = event.params.governorShares;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  increaseCounter(
    "convertfees",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash
  );

  entity.save();

  upsertVault(event.block.number, event.address);
}

export function handleDebtSocialized(event: DebtSocializedEvent): void {
  const entity = new DebtSocialized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.account = event.params.account;
  entity.assets = event.params.assets;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  increaseCounter(
    "debtSocialized",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash
  );

  entity.save();

  upsertVault(event.block.number, event.address);
}

export function handleDeposit(event: DepositEvent): void {
  const entity = new Deposit(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.sender = event.params.sender;
  entity.owner = event.params.owner;
  entity.assets = event.params.assets;
  entity.shares = event.params.shares;
  entity.vault = event.address;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  // the deposit also create
  increaseCounter(
    "deposit", // also called by mint and skim
    event.block.number,
    event.block.timestamp,
    event.transaction.hash
  );

  entity.save();

  upsertVault(event.block.number, event.address);
}

export function handleEVaultCreated(event: EVaultCreatedEvent): void {
  const entity = new EVaultCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.creator = event.params.creator;
  entity.asset = event.params.asset;
  entity.dToken = event.params.dToken;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  increaseCounter(
    "eVaultCreated",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash
  );

  entity.save();

  upsertVault(event.block.number, event.address);
}

export function handleInterestAccrued(event: InterestAccruedEvent): void {
  const entity = new InterestAccrued(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.account = event.params.account;
  entity.assets = event.params.assets;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  increaseCounter(
    "interestAccrued", // also called redeem
    event.block.number,
    event.block.timestamp,
    event.transaction.hash
  );

  entity.save();

  upsertVault(event.block.number, event.address);
}

export function handleLiquidate(event: LiquidateEvent): void {
  const entity = new Liquidate(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.liquidator = event.params.liquidator;
  entity.violator = event.params.violator;
  entity.collateral = event.params.collateral;
  entity.repayAssets = event.params.repayAssets;
  entity.yieldBalance = event.params.yieldBalance;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  increaseCounter(
    "liquidate",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash
  );

  entity.save();

  upsertVault(event.block.number, event.address);
}

export function handlePullDebt(event: PullDebtEvent): void {
  const entity = new PullDebt(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.from = event.params.from;
  entity.to = event.params.to;
  entity.assets = event.params.assets;
  entity.vault = event.address;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  increaseCounter(
    "pulldebt",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash
  );

  entity.save();

  upsertVault(event.block.number, event.address);
}

export function handleRepay(event: RepayEvent): void {
  const entity = new Repay(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.account = event.params.account;
  entity.assets = event.params.assets;
  entity.vault = event.address;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  increaseCounter(
    "repay",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash
  );

  entity.save();

  upsertVault(event.block.number, event.address);
}

export function handleTransfer(event: TransferEvent): void {
  const entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.from = event.params.from;
  entity.to = event.params.to;
  entity.value = event.params.value;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  increaseCounter(
    "transfer",
    event.block.number,
    event.block.timestamp,
    event.transaction.hash
  );

  entity.save();

  upsertVault(event.block.number, event.address);
}

export function handleVaultStatus(event: VaultStatusEvent): void {
  const entity = new VaultStatus(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.vault = event.address;
  entity.totalShares = event.params.totalShares;
  entity.totalBorrows = event.params.totalBorrows;
  entity.accumulatedFees = event.params.accumulatedFees;
  entity.cash = event.params.cash;
  entity.interestAccumulator = event.params.interestAccumulator;
  entity.interestRate = event.params.interestRate;
  entity.timestamp = event.params.timestamp;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  upsertVault(event.block.number, event.address);
}

export function handleWithdraw(event: WithdrawEvent): void {
  const entity = new Withdraw(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.sender = event.params.sender;
  entity.receiver = event.params.receiver;
  entity.owner = event.params.owner;
  entity.assets = event.params.assets;
  entity.shares = event.params.shares;
  entity.vault = event.address;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  increaseCounter(
    "withdraw", // also called redeem
    event.block.number,
    event.block.timestamp,
    event.transaction.hash
  );

  entity.save();

  upsertVault(event.block.number, event.address);
}

//////////////////////////////////////////////////////////////////////////////
// GOVERMENT /////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

export function handleGovSetCaps(event: GovSetCapsEvent): void {
  const entity = new GovSetCaps(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.newSupplyCap = event.params.newSupplyCap;
  entity.newBorrowCap = event.params.newBorrowCap;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleGovSetConfigFlags(event: GovSetConfigFlagsEvent): void {
  const entity = new GovSetConfigFlags(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.newConfigFlags = event.params.newConfigFlags;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleGovSetFeeReceiver(event: GovSetFeeReceiverEvent): void {
  const entity = new GovSetFeeReceiver(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.newFeeReceiver = event.params.newFeeReceiver;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleGovSetGovernorAdmin(
  event: GovSetGovernorAdminEvent
): void {
  const entity = new GovSetGovernorAdmin(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.newGovernorAdmin = event.params.newGovernorAdmin;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleGovSetHookConfig(event: GovSetHookConfigEvent): void {
  const entity = new GovSetHookConfig(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.newHookTarget = event.params.newHookTarget;
  entity.newHookedOps = event.params.newHookedOps;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleGovSetInterestFee(event: GovSetInterestFeeEvent): void {
  const entity = new GovSetInterestFee(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.newFee = event.params.newFee;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleGovSetInterestRateModel(
  event: GovSetInterestRateModelEvent
): void {
  const entity = new GovSetInterestRateModel(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.newInterestRateModel = event.params.newInterestRateModel;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleGovSetLTV(event: GovSetLTVEvent): void {
  const entity = new GovSetLTV(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.collateral = event.params.collateral;
  entity.borrowLTV = event.params.borrowLTV;
  entity.liquidationLTV = event.params.liquidationLTV;
  entity.initialLiquidationLTV = event.params.initialLiquidationLTV;
  entity.targetTimestamp = event.params.targetTimestamp;
  entity.rampDuration = event.params.rampDuration;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleGovSetLiquidationCoolOffTime(
  event: GovSetLiquidationCoolOffTimeEvent
): void {
  const entity = new GovSetLiquidationCoolOffTime(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.newCoolOffTime = event.params.newCoolOffTime;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleGovSetMaxLiquidationDiscount(
  event: GovSetMaxLiquidationDiscountEvent
): void {
  const entity = new GovSetMaxLiquidationDiscount(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.newDiscount = event.params.newDiscount;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
