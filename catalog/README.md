# Endpoint catalog operations

The catalog advertises an operator-selected immutable Euler Simple deployment. Goldsky deployment and promotion remain operator-invoked. No merge or CI job deploys, promotes or publishes. The intended catalog URL is `https://raw.githubusercontent.com/euler-xyz/euler-subgraph/catalog/v1/catalog.json`; it becomes available only after an operator explicitly publishes the `catalog` branch. This code does not establish that the URL is live.

## Contract

[schema.v1.json](schema.v1.json) describes the v1 envelope; [fixture.v1.json](fixture.v1.json) contains synthetic data, not usable deployments. Each record identity is `(chainId, family, channel)`. Stable is the default channel. Candidates are independent and never promote implicitly. Consumers ignore unsupported families/channels and preserve their explicit configuration overrides. Interfaces supplies lifecycle, display names and chain visibility separately.

An active record requires `chainId`, `family`, `channel`, `status`, `version`, `endpoint`, `deploymentId`, `capabilities`, `sourceCommit` and `startBlock`. Versions have three numeric components with an optional fourth hotfix component; each component is zero or a positive integer without leading zeros. `deploymentId` is the observed `_meta.deployment`. `sourceCommit` is a full Git commit recorded from a clean source build. `interfacesCommit` is optional; the build tooling omits it because the address sync does not record an Interfaces revision. Endpoints use credential-free HTTPS without query or fragment. Capabilities are `account-vault-discovery` and `vault-factory-lookup`.

A retirement requires only identity plus `status: "retired"`; consumers must not resurrect a bundled endpoint. Duplicate or malformed identifiable records quarantine that identity. Other valid identities remain usable. Invalid envelopes and unknown schema versions fail closed. The parser reports invalid, missing, retired and unsupported-capability selections distinctly. Publication rejects any invalid or duplicate row rather than dropping existing records. JSON Schema alone cannot enforce identity uniqueness; the parser enforces it.

`publishedAt` is an ISO-8601 date-time with an explicit timezone (`Z` or an offset); it records publication time, not ongoing service health. `revision` is a SHA-256 of the sorted deployment array. Consumers apply bounded freshness, retain source-specific last-good metadata only within their allowed age, and do not extend that age on failures.

## Operator requirements

Requirements: the existing pnpm/Goldsky tooling, Node 22+ for tests, and Bun 1.3+ for `Bun.YAML`. The Git remote uses normal SSH credentials or a credential helper. Never place tokens in a remote URL. RPC credentials remain in environment variables and are not written to receipts/catalogs or logged.

## Publish existing production deployments

Use this procedure to populate the catalog from Simple releases that are deployed and already selected by their Goldsky `latest` aliases. `catalog:publish` reads Goldsky and writes the catalog Git branch; it does not deploy or change tags. Publication requires a matching clean-build receipt for each selected release.

1. **Inventory the existing releases.** Run `goldsky subgraph list` with the intended project credentials. For each chain to offer, record its `scripts/config.ts` network key, chain ID, the exact version targeted by `euler-simple-<network>/latest`, and the corresponding versioned endpoint. Include deprecated chains whose endpoints remain needed for exits. Select the operator-approved alias target, not the highest version or a test fork. Inventory health/sync status alone does not establish catalog readiness.

2. **Obtain matching build evidence.** Recover the retained `.catalog/<network>.json` receipt and its matching build, or reproduce the deployed artifacts from clean, reviewed source with the catalog tooling available. The build must reproduce the selected release's dependencies, network, contracts, start block and any graft configuration. For a normal Base build, the local sequence is:

   ```sh
   pnpm run prepare:base
   pnpm run codegen
   pnpm run build:base
   ```

   These commands prepare local artifacts and attempt to write `.catalog/base.json`. Verify that the receipt was actually written: a successful build can skip its receipt when the checkout is dirty. A successful build also does not prove a match to the running release; publication compares the receipt with the deployed IPFS manifest and artifacts. A normal build cannot substitute for a grafted release's matching build.

   **Receipt recovery is a prerequisite, not an automatic import feature.** The publisher has no receipt-free import mode. If the receipt is missing or the artifacts cannot be matched, leave that chain unpublished and resolve the provenance gap before continuing. Do not fabricate a source commit or bypass the checks. Deploying or retagging a production subgraph is not a step in this procedure.

3. **Configure publication access and select a checkpoint.** Set `CATALOG_GIT_REMOTE` to the intended repository remote, for example `git@github.com:euler-xyz/euler-subgraph.git`, using credentials allowed to create/update its `catalog` branch. Set `RPC_URL_<chainId>` to a trusted RPC (`RPC_URL_8453` for Base). Select a sufficiently recent finalized block at or after the receipt's start block that the release and its alias have indexed. IPFS access is required; set `CATALOG_IPFS_GATEWAY` when using a gateway other than the default described in [Publication validation](#publication-validation).

4. **Publish the selected existing release.** Replace both placeholders with the inventory version and chosen checkpoint:

   ```sh
   pnpm run catalog:publish base <selected-version> stable <checkpoint-number>
   ```

   This validates the exact endpoint, its existing alias and the build evidence before writing the record. Repeat with each selected network's own receipt, version, RPC and checkpoint. The first publication creates `catalog` with `v1/catalog.json`; subsequent publications preserve other identities. Retry publication failures as described in [Retry, retirement and rollback](#retry-retirement-and-rollback). Keep each receipt with its matching build for later retries.

5. **Verify the complete published catalog.** Fetch `https://raw.githubusercontent.com/euler-xyz/euler-subgraph/catalog/v1/catalog.json` and confirm it returns valid v1 JSON with a unique active `euler-simple` / `stable` entry for every chain being switched to catalog resolution. Check the selected version, endpoint, deployment ID and both required capabilities. Successful publication of one chain does not establish coverage for the others. Synthetic fixtures and a successful inventory read do not replace this check.

6. **Verify consumer reads before rollout.** Use the consumer versions that implement catalog resolution and test against the published URL in staging. Exercise the subgraph paths explicitly; successful V3 reads alone do not validate them. Confirm real account-vault discovery and vault-factory lookup select the intended deployments, and that explicit endpoint overrides still take precedence. Use a separate test catalog to check missing/retired entries after a metadata refresh: catalog-selected reads must report an unavailable source rather than silently selecting a bundled endpoint.

   | Consumer | Configuration and checks |
   | --- | --- |
   | Standalone SDK 4.3.0+ | Set `config.subgraphCatalog = { url: catalogUrl }` with the published URL. Inspect config, adapter and environment endpoint maps: explicit entries remain authoritative. Verify both discovery purposes use the intended source. |
   | Lite | Set `SUBGRAPH_CATALOG_URL` and ensure `SUBGRAPH_CATALOG_DISABLED` and the relevant `SUBGRAPH_DISABLED_<chainId>` are not `true`. Clear both `SUBGRAPH_URL_<chainId>` and `NUXT_PUBLIC_SUBGRAPH_URI_<chainId>` only for chains being switched to the catalog. Restart Lite after changing these environment settings, then verify browser proxy and server SDK reads. Keep intended direct overrides for other chains. |
   | Docs | The catalog integration reads the official URL and joins stable publications with Interfaces chain metadata. Verify endpoint links and publication states for the production/deprecated chains shown in the table. |

   RPC enablement, Interfaces lifecycle, V3, labels, ABI configuration and `ONCHAIN_SDK_CHAINS` remain independently configured. A passing publication/consumer check is point-in-time evidence, not a guarantee of ongoing endpoint health or latest indexed data.

## Build, deploy, promote, publish

For a new release, use the existing operator-run deployment flow below. For an already-promoted production release, use [Publish existing production deployments](#publish-existing-production-deployments).

1. Commit the reviewed source and build/deploy with the existing command, for example `pnpm run deploy:base`. Every `build:<network>` command and the hotfix command after its Graph build automatically attempt to write `.catalog/<network>.json` after Graph build. The receipt stores the source commit, configured chain/network/contracts/start block and a fingerprint of the compiled manifest and all referenced artifacts. For a grafted hotfix, the receipt validates the graft base, grafting feature and safe block range, records the compiled start block (`graft.block + 1`), and includes graft settings in the artifact fingerprint. It contains no endpoint or credentials. Dirty source builds remove/skip the receipt and remain deployable; commit and rebuild before catalog publication. Receipt errors do not prevent manual deployment. Receipts are local, gitignored evidence and must be retained with their build when publishing from another machine.
2. The operator chooses the exact release and a sufficiently recent finalized chain checkpoint, at or after the configured start block. Set `RPC_URL_8453` to the trusted Base RPC and `CATALOG_GIT_REMOTE` to the intended repository remote.
3. Run `pnpm run catalog:promote base 1.2.3.1 stable <checkpoint-number>`. This explicitly invoked helper validates the exact candidate, calls `goldsky subgraph tag create euler-simple-base/1.2.3.1 --tag latest` for that release only, and publishes the generated stable record after confirming alias identity. It never deploys. Do not use `tag:deployments` for this step: that helper tags every inventory row.

For a release already promoted with the standalone Goldsky command, or a publication retry, use `pnpm run catalog:publish base 1.2.3.1 stable <checkpoint-number>`. This publish-only command never tags. For an unpromoted candidate, use `catalog:publish` with `candidate`; it cannot change the stable record.

## Publication validation

The publisher reads Goldsky inventory and accepts exactly one immutable URL matching the selected network name and full version. Test forks, other versions and ambiguous project URLs are excluded. It resolves the checkpoint from the trusted RPC, verifies the chain ID and exact block number, and requires a valid block hash. It binds the selected endpoint’s metadata and account-discovery/factory capability queries to that hash, requires the returned metadata to match the exact checkpoint number and hash, and checks indexing errors and CID. It reads the deployed manifest/artifacts from IPFS and matches every artifact plus network/contracts/start block to the build receipt. Stable publication binds the same queries on the `latest` alias to the checkpoint hash and verifies the same CID, exact block number and hash, and absence of indexing errors. Missing inventory, inaccessible IPFS data, query errors, indexing lag or mismatched evidence blocks publication. No successful probe certifies ongoing availability. The default public IPFS gateway is `https://ipfs.io/ipfs/`. Set `CATALOG_IPFS_GATEWAY` to an operator-selected HTTPS gateway base ending in `/ipfs/` (or its equivalent prefix) when needed. Artifact references cannot choose a host, traverse paths or redirect requests. Gateway failures require retrying, not bypassing checks.

The read-only probes are injectable in `scripts/catalog/validate.mjs`. The CLI uses bounded requests and refuses redirects. Goldsky CLI inventory format is not a stable structured API: an unrecognized output format fails closed. The production Goldsky/IPFS flow requires an operator smoke check; fixture tests do not certify provider compatibility.

## Retry, retirement and rollback

Publication reads the current branch, preserves unrelated records and appends one commit. A compare-and-swap push rejects concurrent changes, including two first publishers. Conflicts require rerunning the command; each retry validates the already-selected release again. An unchanged record is idempotent. Git history retains earlier catalog revisions.

A publication failure does not roll back a Goldsky promotion that the operator already performed. The promotion helper reports tag success separately from publication failure. Retry with `catalog:publish` without redeploying or retagging; an ambiguous tag outcome requires inspecting the alias first. An uncertain push may already have succeeded; rerun to reconcile. Raw provider/Git errors are suppressed because they can contain authenticated URLs. Diagnose access independently without sharing credentials.

To retire one identity, set `CATALOG_GIT_REMOTE` and run `pnpm run catalog:retire base stable`. This explicit operation does not alter Goldsky. To roll back, manually select/promote the intended earlier release and rerun publication with its matching retained clean-build receipt; the normal validation gates apply. Never force-reset the publication branch to an older snapshot, which could discard unrelated updates.

Run `node --test tests/catalog/*.test.mjs` (or `pnpm run test:catalog`) for controlled parser/validation fixtures, clean-build receipt tests and temporary local Git-remote tests. No dependency installation is required. The test-only `Catalog tests` GitHub Actions workflow runs this suite on relevant pull requests and pushes with pinned Node 24.22.0, read-only repository permissions and checkout credential persistence disabled. These tests never use Goldsky, production RPCs, provider credentials or the publication remote; the workflow has no deployment, tag or publication steps.

For changes to the producer/consumer boundary, run the [offline cross-repo contract checks](../tests/consumers/README.md) against the SDK, Lite and Docs checkouts under review. The suite exercises actual consumer source, including Lite's installed SDK and the SDK source being reviewed; it requires those checkouts and their locked dependencies.
