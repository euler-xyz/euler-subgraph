# Euler Subgraph

## Prerequisites
- Node.js (v16 or higher)
- pnpm
- Bun
- Goldsky CLI (required for all deployments)

## Setup
1. Install dependencies:
```bash
pnpm install
```

2. Run Sync Abis to add a new network:
```bash
pnpm run abis:sync
```

3. Update `prepare.ts` to add the new network name and startBlock for syncing.

4. Generate code:
```bash
pnpm run codegen
```

## Available Scripts

### Build Scripts
```bash
# Build for specific networks
pnpm run build:mainnet
pnpm run build:base
pnpm run build:arbitrum
pnpm run build:swell
pnpm run build:sonic
pnpm run build:ink
pnpm run build:berachain
pnpm run build:bob
pnpm run build:unichain
pnpm run build:avalanche

# Build scripts with TypeScript
pnpm run build:scripts
```

### Deployment Scripts
```bash
# Deploy to specific networks
pnpm run deploy:mainnet
pnpm run deploy:base
pnpm run deploy:arbitrum
pnpm run deploy:swell
pnpm run deploy:sonic
pnpm run deploy:ink
pnpm run deploy:berachain
pnpm run deploy:bob
pnpm run deploy:unichain
pnpm run deploy:avalanche

# Deploy test versions (with -test suffix)
pnpm run deploy:mainnet:test
```

### Utility Scripts
```bash
# Sync ABIs and addresses
pnpm run abis:sync

# Prepare configurations for specific networks
pnpm run prepare:mainnet
pnpm run prepare:base
pnpm run prepare:arbitrum
pnpm run prepare:swell
pnpm run prepare:sonic
pnpm run prepare:ink
pnpm run prepare:berachain
pnpm run prepare:bob
pnpm run prepare:unichain
pnpm run prepare:avalanche

# Verify account data
pnpm run verify:accountPositions
pnpm run verify:accountVaultBalances

# Run tests
pnpm run test
```

## Deployment Guide

### Important Notes
- All deployments are handled through Goldsky
- Test deployments are available with the `:test` suffix (e.g., `deploy:mainnet:test`)
- Make sure you have the Goldsky CLI installed and configured with your credentials

### Network-Specific Deployment

#### Mainnet
```bash
# Production deployment
pnpm run deploy:mainnet

# Test deployment
pnpm run deploy:mainnet:test
```

#### Other Networks
```bash
# Base
pnpm run deploy:base

# Arbitrum
pnpm run deploy:arbitrum

# Swell
pnpm run deploy:swell

# Sonic
pnpm run deploy:sonic

# Ink
pnpm run deploy:ink

# Berachain
pnpm run deploy:berachain

# Bob
pnpm run deploy:bob

# Unichain
pnpm run deploy:unichain

# Avalanche
pnpm run deploy:avalanche
```

### Verification
To verify account data:
```bash
# Verify account positions
pnpm run verify:accountPositions

# Verify account vault balances
pnpm run verify:accountVaultBalances
```

## Development

### TypeScript Configuration
The project uses separate TypeScript configurations:
- Main configuration (`tsconfig.json`): For the core subgraph code
- Scripts configuration (`tsconfig.scripts.json`): For development and utility scripts

### Testing
```bash
# Run tests
pnpm run test
```

## Troubleshooting
- If you encounter permission issues with scripts, run:
  ```bash
  chmod +x scripts/abisAddressesSync.sh
  ```
- For deployment issues, check your Goldsky CLI configuration and credentials
- Make sure you have the correct CLI tools installed and configured
