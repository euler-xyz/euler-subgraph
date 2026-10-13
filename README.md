# Euler simple subgraph

The `simple-subgraph` branch is Euler's per-chain fallback data source. It lists every Euler vault on a chain and every account's positions in them, so an app can run on a chain plus its subgraph alone and read everything else on chain.

Each network is deployed to Goldsky as `euler-simple-<slug>`, and the version consumers should read carries the `latest` tag. DeBank reads these subgraphs, so `latest` must stay current on every network (see [Tagging `latest`](#tagging-latest)).

## What it indexes

| Source | Events | Effect |
| --- | --- | --- |
| EVault factory (`eVaultFactory`) | `ProxyCreated` | Adds a `Vault` and indexes it with the `EulerVault` template |
| EulerEarn factory (`eulerEarnFactory`) | `CreateEulerEarn` | Adds a `Vault` and indexes it with the `ERC4626Vault` template |
| Securitize collateral factory (`securitizeFactory`, only for networks whose addresses define it) | `ContractDeployed` | Adds a `Vault` and indexes it with the `ERC4626Vault` template |
| `EulerVault` template | `Transfer`, `Borrow`, `Repay` | Updates the account's tracking entities |
| `ERC4626Vault` template | `Transfer` | Updates the account's tracking entities |

Entities, from [`schema.graphql`](schema.graphql):

- `Vault`: a vault address and the factory that created it.
- `TrackingActiveAccount`: keyed by the 19-byte address prefix that an owner shares with its 256 sub-accounts. It lists the account-and-vault pairs that hold a deposit (`deposits`) or a borrow (`borrows`).
- `TrackingVaultBalance`: keyed by account and vault. It holds the `balanceOf` and `debtOf` values read at the account's latest event in that vault.

The manifest sets `indexerHints.prune: auto`, so the subgraph serves current state, not history.

## Networks

Networks are the keys of `networks` in [`scripts/config.ts`](scripts/config.ts). The slug is what the scripts take (`pnpm build:<slug>`) and what the Goldsky name ends with. The Goldsky network is the `network:` value written into `subgraph.yaml`. Addresses are read from `contracts/addresses/<chainId>/`.

| Slug | Chain ID | Goldsky network |
| --- | --- | --- |
| `mainnet` | 1 | `mainnet` |
| `arbitrum` | 42161 | `arbitrum-one` |
| `base` | 8453 | `base` |
| `swell` | 1923 | `swell` |
| `sonic` | 146 | `sonic` |
| `ink` | 57073 | `ink` |
| `unichain` | 130 | `unichain` |
| `avalanche` | 43114 | `avalanche` |
| `berachain` | 80094 | `berachain-mainnet` |
| `bob` | 60808 | `bob` |
| `bsc` | 56 | `bsc` |
| `worldchain` | 480 | `worldchain` |
| `hyperevm` | 999 | `hyperevm` |
| `optimism` | 10 | `optimism` |
| `gnosis` | 100 | `xdai` |
| `tacturin` (testnet) | 2390 | `tac-turin` |
| `tac` | 239 | `tac` |
| `linea` | 59144 | `linea` |
| `plasma` | 9745 | `plasma-mainnet` |
| `mantle` | 5000 | `mantle` |
| `monad` | 143 | `monad` |
| `morph` | 2818 | `morph` |
| `polygon` | 137 | `matic` |
| `sepolia` (testnet) | 11155111 | `sepolia` |

As of October 2026, euler-interfaces has no `addresses/<chainId>/` folder for `ink`, `worldchain`, `optimism`, `gnosis` and `mantle`, and keeps `swell`, `morph`, `tacturin` and `sepolia` under `addresses/test/`. Those networks build from the committed addresses, and `abisAddressesSync.sh <chainId>` fails for them (`abisAddressesSync.sh test <chainId>` reads `addresses/test/`).

## Local build

You need Node.js 18 or later, Bun, and pnpm 9.12.3. `.npmrc` sets `engine-strict`, so other pnpm versions refuse to run; `corepack enable` picks up the version pinned in `package.json`.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm prepare:<slug>   # renders template/subgraph.template.yaml into subgraph.yaml
pnpm codegen          # writes generated/ from subgraph.yaml and schema.graphql
pnpm build            # compiles into build/
pnpm test             # Matchstick tests in tests/, after codegen
```

Run `pnpm codegen` after every `prepare`: the generated types depend on which data sources the network has. `pnpm build:<slug>` runs `prepare:<slug>` and `graph build` but skips codegen.

## Goldsky

Every network deploys to Euler's Goldsky project. Install the CLI with `curl https://goldsky.com | sh` or `npm install -g @goldskycom/cli`, then log in to that project:

```bash
goldsky login                        # browser login; choose the Euler project
goldsky project list                 # shows the projects you belong to
goldsky project switch <project-id>  # if another project is active
```

Without a browser, create an API key on the project's Settings page and run `goldsky login --token <api-key>`. An API key is bound to the project it was created in.

- Name: `euler-simple-<slug>/<version>`, from `PROTOCOL_VERSION` in `scripts/config.ts`.
- Endpoint: `https://api.goldsky.com/api/public/<project-id>/subgraphs/euler-simple-<slug>/<version-or-tag>/gn`.
- `goldsky subgraph list euler-simple-<slug>` shows the deployed versions and their tags.

### Deploying

```bash
pnpm prepare:<slug> && pnpm codegen
pnpm deploy:<slug>
```

`deploy:<slug>` runs `build:<slug>`, then `scripts/deploy.ts` deploys the next patch version: it reads the current version from `deployments.json` if that file exists, otherwise from `goldsky subgraph list`. A network's first deploy is `1.0.1`. For grafted hotfix deploys, see [hotfix/README.md](hotfix/README.md).

`deploy:mainnet:test`, `deploy:base:test` and `deploy:mainnet:swap` deploy under a suffixed name, such as `euler-simple-mainnet-test`.

### Tagging `latest`

Consumers such as DeBank query `.../subgraphs/euler-simple-<slug>/latest/gn`. A new version indexes from `startBlock`, so move `latest` to it only once it has caught up with the chain head; before that, the tag serves partial data.

```bash
goldsky subgraph tag create euler-simple-<slug>/<version> --tag latest
```

`pnpm generate:deployments` writes the newest version of every network to `deployments.json`, and `pnpm tag:deployments` tags every entry in that file `latest`. Use it only when all of those versions have synced.

### Checking a deployment

With `deployments.json` in place:

```bash
pnpm verify:accountPositions <slug> <address>
pnpm verify:accountVaultBalances <slug> <address>
```

## New network

1. **Sync the addresses.** Euler's addresses live in [euler-interfaces](https://github.com/euler-xyz/euler-interfaces) under `addresses/<chainId>/`. After `pnpm install`, run on macOS (the script uses BSD `sed -i ''`):

   ```bash
   ./scripts/abisAddressesSync.sh <chainId>   # same as pnpm abis:sync <chainId>
   ```

   It clones euler-interfaces at `master` (a branch name as the second argument picks another) and writes `contracts/addresses/<chainId>/` and the TypeScript ABIs under `contracts/abi/`. The subgraph reads only `eVaultFactory`, `eulerEarnFactory` and `securitizeFactory` from those addresses; its ABIs are the JSON files in `abis/`.

2. **Export the addresses** from `contracts/addresses/index.ts`:

   ```ts
   export * as <name>Addresses from "./<chainId>"
   ```

3. **Add the network to `scripts/config.ts`.** Copy an existing entry of `networks` and set:
   - the key: the network slug;
   - `network`: Goldsky's subgraph slug for the chain. Find the chain on Goldsky's [supported networks](https://docs.goldsky.com/chains/supported-networks) page; its chain page lists the slug under **Subgraphs** (for example `matic` for Polygon, `xdai` for Gnosis, `plasma-mainnet` for Plasma);
   - `startBlock`: one start block is shared by all data sources. Use the block of the first factory event on the chain, or any block before it. Vaults created before `startBlock` are never indexed.

4. **Add the scripts** `prepare:<slug>`, `build:<slug>` and `deploy:<slug>` to `package.json`, next to the existing ones.

5. **Build and test** as in [Local build](#local-build).

6. **Deploy** to the Euler Goldsky project as in [Deploying](#deploying).

7. **Tag `latest`** once the new version has synced, as in [Tagging `latest`](#tagging-latest).
