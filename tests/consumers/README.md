# Catalog consumer contract checks

This offline suite composes the Subgraph producer with the public SDK package and source from the Lite and Docs checkouts selected by the operator. It runs real validation, publication-envelope generation, parsers, resolvers and Lite's query wrapper. HTTP responses are controlled fixtures; the suite never invokes Goldsky, catalog publication, a deployment, a wallet or an external service.

Use Node 24.22 or newer in the Node 24 line. Install each selected checkout's locked dependencies and the SDK's pinned pnpm version first. The suite rebuilds the SDK before resolving its public package entry; it does not import SDK adapters through internal source paths. Run from the Subgraph repository:

```sh
EULER_SDK_ROOT=/absolute/path/euler-sdks \
EULER_LITE_ROOT=/absolute/path/euler-lite \
EULER_DOCS_ROOT=/absolute/path/euler-docs-v2 \
npm run test:catalog:consumers
```

The three paths are required. Missing checkouts or dependencies fail the run rather than skipping compatibility checks. The run prints consumer commit IDs and tests the files currently on disk, including local edits. For Lite and Docs, the test loader strips TypeScript using Node and resolves only checkout-local TypeScript paths and Lite's `~/` alias; it does not copy or replace production logic.

Coverage includes authenticated existing-deployment import without source/build claims, hash-bound producer validation, unchanged producer records accepted by all three consumers, duplicate quarantine, retirement, lifecycle visibility, explicit fork URLs/disables without metadata fetches, refresh retirement, independent SDK polling provenance, and Lite's account pagination/source checks with both its installed SDK and the SDK public package under review.

The ordinary `test:catalog` CI suite remains self-contained. Run this additional composition suite when changing the catalog wire format, a consumer parser/resolver, or the SDK/Lite query contract. These controlled checks do not certify a live operator publication or provider inventory or artifact access. SDK 4.3.0 can run Lite's checked query integration, but its standalone catalog parser requires build provenance; standalone consumers need the SDK optional-provenance update for imported records.
