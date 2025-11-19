# Hotfix Deployment Guide

This folder contains hotfix configurations for deploying subgraph fixes using grafting.

## What is Grafting?

Grafting allows you to deploy a new version of a subgraph that reuses indexed data from a previous version, enabling quick hotfix deployment without re-indexing from scratch.

## Creating a Hotfix Configuration

Create a JSON file in this folder with the following structure:

```json
{
  "chain": "mainnet",
  "baseVersion": "1.0.12",
  "graftBlock": 23834361,
  "deploymentId": "",
  "fork": "",
  "description": "Description of the hotfix"
}
```

### Configuration Fields

- **chain** (required): The network name (e.g., "mainnet", "arbitrum", "base")
- **baseVersion** (required): The version of the subgraph that failed (e.g., "1.0.12")
- **graftBlock** (required): The block number where the previous subgraph stopped indexing
- **deploymentId** (optional): The deployment ID of the base subgraph. If not provided, the script will attempt to fetch it automatically
- **fork** (optional): If deploying a fork, specify the fork name (e.g., "test", "swap")
- **description** (optional): A description of what this hotfix addresses

## Getting the Deployment ID

The deployment ID is required for grafting. You can find it by:

1. **Automatic**: The script will attempt to fetch it automatically from goldsky
2. **Manual**: Run `goldsky subgraph list <subgraph-name>` and look for the deployment ID in the output
3. **From URL**: The deployment ID may be visible in the subgraph URL

## Deploying a Hotfix

1. Create or edit a hotfix configuration file in this folder
2. Run the deployment script:

```bash
bun scripts/deploy-hotfix.ts hotfix/<config-file>.json
```

For example:
```bash
bun scripts/deploy-hotfix.ts hotfix/mainnet-1.0.12.json
```

The script will:
- Load the hotfix configuration
- Attempt to fetch the deployment ID if not provided
- Generate a new `subgraph.yaml` with grafting configuration
- Build the subgraph
- Deploy the new version (patch version incremented)

## Important Notes

⚠️ **After the hotfix is stable**, you should deploy a non-grafted version for long-term maintenance. Grafting is intended for quick fixes, not permanent solutions.

⚠️ **Schema Compatibility**: Grafting requires the new subgraph's schema to be compatible with the base subgraph's schema. Incompatible schema changes will cause errors.

⚠️ **Block Number**: Use the block number of the **last successfully indexed event**, not the block where the error occurred.

## Example Workflow

1. Subgraph `euler-v2-mainnet/1.0.12` stops indexing at block 23834361
2. Create `hotfix/mainnet-1.0.12.json` with the configuration
3. Fix the issue in the subgraph code
4. Run `bun scripts/deploy-hotfix.ts hotfix/mainnet-1.0.12.json`
5. The script deploys `euler-v2-mainnet/1.0.13` with grafting from block 23834361
6. Monitor the new deployment to ensure it's working correctly
7. Once stable, deploy a fresh version without grafting for long-term maintenance

