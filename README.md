# Euler Subgraph

## Prerequisites

- Node.js (v16 or higher)
- Corepack (enabled in Node.js)
- Bun
- Goldsky CLI (required for all deployments)

### Setting up pnpm with Corepack
This project uses pnpm 9.12.3. Corepack will automatically manage the correct pnpm version for you.

```bash
# Enable corepack if not already enabled
corepack enable

# Install pnpm 9.12.3 using corepack
corepack prepare pnpm@9.12.3 --activate

# First time setup
pnpm install

# Corepack will automatically use pnpm 9.12.3 for this project
# while other projects can use their own versions
```

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Run Sync Abis to add a new network:

```bash
pnpm run abis:sync
```

3. Update `prepare.ts` to include the new network name and start block for syncing. Then run prepare to generate the `subgraph.yaml`.

```bash
pnpm run prepare:mainnet
```

4. Generate code:

```bash
pnpm run codegen
```

6. Build the subgraph:
```bash
pnpm run build:mainnet
```

Note: You can replace `mainnet` with any other supported network (base, arbitrum, swell, etc.) in the above commands.

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
pnpm run build:bsc

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
pnpm run deploy:bsc

# Deploy test versions (with -test suffix)
pnpm run deploy:mainnet:test
```

### Utility Scripts

```bash
# Sync ABIs and addresses
pnpm run abis:sync

# Generate deployments information
pnpm run generate:deployments

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
pnpm run prepare:bsc

# Verify account data
pnpm run verify:accountPositions
pnpm run verify:accountVaultBalances

# Run tests
pnpm run test

# Deploy hotfix (see hotfix/README.md for details)
pnpm run deploy:hotfix <hotfix-config.json>
```

## Deployment Guide

### Important Notes

- All deployments are handled through Goldsky
- Test deployments are available with the `:test` suffix (e.g., `deploy:mainnet:test`)
- Make sure you have the Goldsky CLI installed and configured with your credentials
- You can generate a JSON file with all deployment URLs using `pnpm run generate:deployments`
- For deploying hotfixes using grafting, see [Hotfix Deployment Guide](./hotfix/README.md)

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

# BSC
pnpm run deploy:bsc
```

### Deployments Information

The `generate:deployments` command creates a `deployments.json` file that contains information about the latest deployed version of the subgraph for each supported network. This file is automatically updated after each deployment.

#### File Structure

```json
[
  {
    "network": "mainnet",
    "url": "https://...",
    "version": "1.2.3"
  },
  {
    "network": "base",
    "url": "https://...",
    "version": "1.2.3"
  }
  // ... other networks
]
```

#### Usage

- The file is used by verification scripts to get the correct subgraph URL for each network
- It's automatically updated after each deployment
- It serves as a single source of truth for deployment information
- Only keeps the latest version for each network
- Versions are properly sorted (major.minor.patch)

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
