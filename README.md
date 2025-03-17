
# Deployment Guide

## 1. Update Addresses
Update the `network.json` file and add the required chain details.

---

## 2. Generate Code
Run the following command to generate the necessary code:
```bash
pnpm run codegen
```

---

## 3. Deployment Steps

REMEMBER TO CHECK https://thegraph.com/docs/en/supported-networks/

### Deploy on Mainnet
1. Build the project for Mainnet:
   ```bash
   pnpm run build:mainnet
   ```
2. Deploy the subgraph:
   ```bash
   graph deploy euler-v2-mainnet
   ```

### Deploy on BASE
1. Build the project for BASE:
   ```bash
   pnpm run build:base
   ```
2. Deploy the subgraph:
   ```bash
   graph deploy euler-v2-base
   ```

### Deploy on SWELL
1. Build the project for SWELL:
   ```bash
   pnpm run build:swell
   ```
2. Deploy the subgraph:
   ```bash
   goldsky subgraph deploy euler-v2-swell/1.0.2
   ```

### Deploy on SONIC
1. Build the project for SONIC:
   ```bash
   pnpm run build:sonic
   ```
2. Deploy the subgraph:
   ```bash
   graph deploy euler-v2-sonic
   ```

### Deploy on INK
1. Build the project for INK:
   ```bash
   pnpm run build:ink
   ```
2. Deploy the subgraph:
   ```bash
   graph deploy euler-v2-ink
   ```

### Deploy on BERACHAIN 
1. Build the project for BERACHAIN:
   ```bash
   pnpm run build:berachain
   ```
2. Deploy the subgraph:
   ```bash
   graph deploy euler-v2-berachain  
   ```

### Deploy on BOB
1. Build the project for BOB:
   ```bash
   pnpm run build:bob
   ```   
2. Deploy the subgraph:
   ```bash
   goldsky subgraph deploy euler-v2-bob/1.0.2
   ```
### Deploy on UNICHAIN 
1. Build the project for UNICHAIN:
   ```bash
   pnpm run build:unichain
   ```
2. Deploy the subgraph:
   ```bash
   graph deploy euler-v2-unichain  
   ```
### Run verify scripts
1. Run the verify script for account positions:
   ```bash
   pnpm run verify:accountPositions mainnet <mainAddress>
   ```

2. Run the verify script for account vault balances:
   ```bash
   pnpm run verify:accountVaultBalances mainnet <mainAddress>
   ```
