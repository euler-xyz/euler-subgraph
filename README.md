# Euler Subgraph

## Prerequisites

- Node.js 24.22 or newer in the Node 24 line
- Corepack (enabled in Node.js)
- Bun 1.3 or newer
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

Install the locked dependencies:

```bash
pnpm install --frozen-lockfile
```

## Add a network

1. Add one entry to `networks` in `scripts/config.ts`. The key is a lowercase alphanumeric name used by the commands and the Goldsky subgraph name. Set:
   - `chainId`: the numeric chain ID.
   - `network`: the Graph network name supported by Goldsky.
   - `eVaultFactory` and `eulerEarnFactory`: from euler-interfaces `addresses/<chainId>/CoreAddresses.json`.
   - `securitizeFactory`: from `addresses/<chainId>/PeripheryAddresses.json`, only when the address is nonzero. Omit the field otherwise.
   - `startBlock`: the block in which the chain's EVC was deployed.

   The template reads these values directly. Adding a network requires no per-network package scripts. The subgraph mappings use the checked-in `abis/` files.

2. Commit the reviewed source, log in to Goldsky, and deploy from the clean commit:

   ```bash
   pnpm run deploy <network>
   ```

   This prepares `subgraph.yaml`, runs Graph code generation and compilation, attempts a local catalog build receipt, and deploys the next version through Goldsky. To build without deploying, run `pnpm run build <network>`. A dirty checkout remains buildable and deployable but cannot produce artifact-verification evidence; retain the clean build and its `.catalog/<network>.json` receipt for publication.

3. Once the release has caught up, set `RPC_URL_<chainId>` and `CATALOG_GIT_REMOTE`, select a recent retained checkpoint, and run:

   ```bash
   pnpm run catalog:promote <network> <version> stable <checkpoint-block>
   ```

   This validates the selected release, changes its `latest` tag, and publishes the catalog record. Artifact-verified promotion requires retrievable deployed artifacts. See [catalog operations](catalog/README.md#build-deploy-promote-publish) for checkpoint selection, receipt requirements, artifact access and the explicit import flow for existing deployments. Goldsky deployments, promotion and catalog publication are operator-invoked; merging code or running CI performs none of them.

## Available scripts

| Command | Purpose |
| --- | --- |
| `pnpm run prepare <network>` | Render `subgraph.yaml` for one configured network. |
| `pnpm run build <network>` | Prepare, generate bindings, compile, and attempt a local catalog receipt. |
| `pnpm run deploy <network>` | Build and manually deploy the next Goldsky version. |
| `pnpm run deploy <network> test` | Build and deploy the `-test` subgraph. |
| `pnpm run deploy <network> swap` | Build and deploy the `-swap` subgraph. |
| `pnpm run deploy:hotfix <hotfix-config.json>` | Deploy a grafted hotfix; see the [hotfix guide](hotfix/README.md). |
| `pnpm run generate:deployments` | Refresh the local deployment inventory. |
| `pnpm run verify:accountPositions` | Verify indexed account positions. |
| `pnpm run verify:accountVaultBalances` | Verify indexed account vault balances. |
| `pnpm run test` | Run mapping tests with Graph's test runner. |
| `pnpm run test:catalog` | Run offline catalog and command regressions with Node 24.22 or newer. |

The generic prepare/build/deploy commands and the catalog commands reject unknown flags and excess arguments before starting work. `catalog:import` explicitly supports a final `--dry-run`; `pnpm run deploy`, publication, promotion and retirement commands do not. The package's `prepare` install lifecycle does not select a network; an explicit `pnpm run prepare <network>` does.

## Deployment guide

All deployments use the Goldsky CLI and the operator's credentials. Test and swap forks have their own subgraph names and do not select or publish a stable catalog record. [Catalog operations](catalog/README.md) describes the separately invoked publication commands.

### Deployments Information

The `generate:deployments` command creates a `deployments.json` file that contains information about the latest deployed version of the subgraph for each supported network. Run the command explicitly to refresh this local inventory. It does not publish the endpoint catalog.

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
- Refresh it explicitly with `pnpm run generate:deployments`
- It is a local inventory for verification scripts; it does not establish operator promotion
- Only keeps the latest version for each network
- Its selection compares three version components; use the exact-release catalog tooling for hotfix publication

### Verification

To verify account data:

```bash
# Verify account positions
pnpm run verify:accountPositions

# Verify account vault balances
pnpm run verify:accountVaultBalances
```

## Development

### Testing

```bash
# Run tests
pnpm run test
```

## Troubleshooting

- For deployment issues, check your Goldsky CLI configuration and credentials
- Make sure you have the correct CLI tools installed and configured

### Published endpoint catalog

To populate the catalog from deployed Simple releases, follow [Publish existing production deployments](catalog/README.md#publish-existing-production-deployments). The explicit import command discovers and validates deployed releases without build receipts or IPFS access and preserves existing Goldsky deployments and tags. Imported records omit unverified build provenance; artifact-verified publication remains available separately. See [catalog operations](catalog/README.md) for the opt-in v1 contract, consumer checks, and the separate deployment/promotion flow for new releases.
