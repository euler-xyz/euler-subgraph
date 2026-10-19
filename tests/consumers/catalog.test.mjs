import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { execFileSync } from 'node:child_process'
import { roots, sourceUrl } from './loader.mjs'
import { updateCatalog } from '../../scripts/catalog/catalog.mjs'
import { fingerprintManifest, manifestScope, validateRelease } from '../../scripts/catalog/validate.mjs'
import { createCheckpointProbes } from '../../scripts/catalog/probes.mjs'

const sdk = await import(sourceUrl('sdk', 'packages/euler-v2-sdk/src/utils/subgraphCatalog.ts'))
const { AccountVaultsSubgraphAdapter: AccountAdapter } = await import(sourceUrl('sdk', 'packages/euler-v2-sdk/src/services/accountService/adapters/accountOnchainAdapter/accountVaultsSubgraphAdapter.ts'))
const { VaultTypeSubgraphAdapter: FactoryAdapter } = await import(sourceUrl('sdk', 'packages/euler-v2-sdk/src/services/vaults/vaultMetaService/adapters/VaultTypeSubgraphAdapter.ts'))
const lite = await import(sourceUrl('lite', 'server/utils/subgraph-catalog.ts'))
const checked = await import(sourceUrl('lite', 'utils/subgraph-queries.ts'))
const lifecycle = await import(sourceUrl('lite', 'utils/chain-status.ts'))
const docs = await import(sourceUrl('docs', 'docs/components/NetworkTabs/subgraph-catalog.ts'))
const registry = await import(sourceUrl('docs', 'docs/components/NetworkTabs/config.ts'))
const liteRequire = createRequire(sourceUrl('lite', 'package.json'))
const installedSdk = dirname(liteRequire.resolve('@eulerxyz/euler-v2-sdk/package.json'))
const { AccountVaultsSubgraphAdapter: InstalledAccountAdapter } = await import(pathToFileURL(resolve(installedSdk, 'dist/src/services/accountService/adapters/accountOnchainAdapter/accountVaultsSubgraphAdapter.js')).href)
const { VaultTypeSubgraphAdapter: InstalledFactoryAdapter } = await import(pathToFileURL(resolve(installedSdk, 'dist/src/services/vaults/vaultMetaService/adapters/VaultTypeSubgraphAdapter.js')).href)
for (const [name, cwd] of Object.entries(roots)) {
  console.log(`Consumer ${name}: ${execFileSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8' }).trim()}`)
}
const noNetwork = async () => { throw new Error('Unexpected external request in offline contract check') }
globalThis.fetch = noNetwork
afterEach(() => { globalThis.fetch = noNetwork })

const checkpointNumber = 20529300
const checkpointHash = '0x' + '1'.repeat(64)
const deployedCid = 'QmContractDeployment'
const endpoint = 'https://api.goldsky.com/api/public/project_contract/subgraphs/euler-simple-mainnet/1.2.3.1/gn'
const manifest = { dataSources: [{ network: 'mainnet', source: { address: '0x' + '1'.repeat(40), startBlock: 20529207 }, mapping: { file: 'mapping.wasm' } }], schema: { file: 'schema.graphql' } }
const artifact = async file => Buffer.from(file.includes('schema') ? 'schema' : 'mapping')
const receipt = { schemaVersion: 1, network: 'mainnet', name: 'euler-simple-mainnet', chainId: 1, sourceCommit: 'a'.repeat(40), interfacesCommit: 'b'.repeat(40), startBlock: 20529207, scope: manifestScope(manifest), manifestFingerprint: await fingerprintManifest(manifest, artifact) }
const selected = { version: '1.2.3.1', channel: 'stable', checkpoint: checkpointNumber }
const emptyCatalog = { schemaVersion: 1, revision: 'initial', publishedAt: '2026-10-19T00:00:00.000Z', deployments: [] }
const publicationTime = new Date('2026-10-19T01:00:00.000Z')
const proof = []
const checkpointProbes = createCheckpointProbes({
  rpc: 'https://rpc.example.invalid',
  request: async (url, body) => {
    proof.push({ url, body })
    let value
    if (body.method === 'eth_chainId') value = { result: '0x1' }
    else if (body.method === 'eth_getBlockByNumber') value = { result: { number: '0x' + checkpointNumber.toString(16), hash: checkpointHash } }
    else value = { data: { _meta: { deployment: deployedCid, hasIndexingErrors: false, block: { number: checkpointNumber, hash: body.query.includes('hash:') ? checkpointHash : null } }, trackingActiveAccounts: [], vaults: [] } }
    return Buffer.from(JSON.stringify(value))
  },
})
const release = await validateRelease(selected, receipt, { ...checkpointProbes, inventory: async () => endpoint, manifest: async () => manifest, artifact })
const publication = updateCatalog(emptyCatalog, release, publicationTime)
const expectReason = reason => error => error?.reason === reason
const makeLite = (catalog, extra = {}) => lite.createSubgraphResolver({ env: { SUBGRAPH_CATALOG_URL: 'https://catalog.example.invalid' }, fetchCatalog: async () => catalog, ...extra })

test('hash-validated producer output is accepted by SDK, Lite and Docs without rewriting', async () => {
  assert.deepEqual(proof.slice(0, 2).map(({ body }) => body.method), ['eth_chainId', 'eth_getBlockByNumber'])
  const graphs = proof.filter(({ body }) => body.query)
  assert.equal(graphs.length, 2)
  for (const { body } of graphs) assert.equal((body.query.match(/hash:/g) ?? []).length, 3)
  assert.equal(publication.deployments[0].interfacesCommit, receipt.interfacesCommit)
  const source = await sdk.createSubgraphCatalogResolver({ catalog: publication }).resolve(1, 'account-vault-discovery')
  assert.deepEqual(source, { endpoint, deploymentId: deployedCid })
  const liteSource = await makeLite(publication)(1)
  assert.equal(liteSource.endpoint, source.endpoint)
  assert.equal(liteSource.deploymentId, source.deploymentId)
  assert.match(liteSource.identity, /^[a-f0-9]{64}$/)
  assert.deepEqual(docs.parseSubgraphCatalog(publication).entries.get(1), { status: 'published', endpoint, version: selected.version })
})

test('all consumers quarantine duplicate identities and honor authoritative retirement', async () => {
  for (const retired of [false, true]) {
    const catalog = retired
      ? updateCatalog(publication, { chainId: 1, family: 'euler-simple', channel: 'stable', status: 'retired' }, publicationTime)
      : { ...publication, deployments: [release, { ...release }] }
    const reason = retired ? 'retired' : 'invalid'
    await assert.rejects(sdk.createSubgraphCatalogResolver({ catalog }).resolve(1, 'account-vault-discovery'), expectReason(reason))
    await assert.rejects(makeLite(catalog)(1), expectReason(reason))
    assert.equal(docs.parseSubgraphCatalog(catalog).entries.get(1).status, reason)
  }
})

test('catalog membership cannot enable unlisted or production-hidden staging chains', () => {
  const chains = ['production', 'deprecated', 'staging', 'unlisted'].map((status, i) => ({ chainId: i + 1, name: status, status, addresses: {} }))
  let catalog = emptyCatalog
  for (const chain of chains) catalog = updateCatalog(catalog, { ...release, chainId: chain.chainId }, publicationTime)
  const rows = docs.joinSubgraphCatalog(registry.parseListedEulerChains(chains), docs.parseSubgraphCatalog(catalog))
  assert.deepEqual(rows.map(row => row.chainId), [1, 2])
  const config = { enabledChainIds: [1, 2, 3, 4], deprecatedChainIds: [], onchainSdkChainIds: [], eVaultFetchChunkChainIds: [] }
  assert.deepEqual(lifecycle.applyChainRegistry(config, lifecycle.readChainRegistry(chains), true).enabledChainIds, [1, 2])
  assert.deepEqual(lifecycle.applyChainRegistry(config, lifecycle.readChainRegistry(chains), false).enabledChainIds, [1, 2, 3])
})

test('fork direct overrides and explicit disables bypass metadata in SDK and Lite', async () => {
  let fetches = 0
  const metadata = async () => { fetches++; throw new Error('metadata must be bypassed') }
  const resolver = sdk.createSubgraphCatalogResolver({ url: 'https://catalog.example.invalid', fetch: metadata })
  assert.equal(await sdk.resolveSubgraphEndpoint(1, 'account-vault-discovery', { 1: '/fork/accounts' }, resolver), '/fork/accounts')
  await assert.rejects(sdk.resolveSubgraphEndpoint(1, 'account-vault-discovery', { 1: false }, resolver), expectReason('disabled'))
  const resolve = lite.createSubgraphResolver({ env: { SUBGRAPH_CATALOG_URL: 'https://catalog.example.invalid', SUBGRAPH_URL_1: '/fork/accounts', SUBGRAPH_DISABLED_2: 'true', SUBGRAPH_URL_2: '/fork/disabled' }, fetchCatalog: metadata })
  assert.equal((await resolve(1)).endpoint, '/fork/accounts')
  await assert.rejects(resolve(2), expectReason('disabled'))
  assert.equal(fetches, 0)
})

test('a successful retirement refresh replaces last-good active metadata in all consumers', async () => {
  let time = 0
  let current = publication
  const resolver = sdk.createSubgraphCatalogResolver({ url: 'https://catalog.example.invalid', now: () => time, fetch: async () => Response.json(current) })
  const resolveLite = makeLite(current, { now: () => time, fetchCatalog: async () => current })
  await resolver.resolve(1, 'account-vault-discovery')
  await resolveLite(1)
  time = 60000
  current = updateCatalog(current, { chainId: 1, family: 'euler-simple', channel: 'stable', status: 'retired' }, publicationTime)
  await assert.rejects(resolver.resolve(1, 'account-vault-discovery'), expectReason('retired'))
  await assert.rejects(resolveLite(1), expectReason('retired'))
  assert.equal(docs.parseSubgraphCatalog(current).entries.get(1).status, 'retired')
  assert.deepEqual(await docs.fetchSubgraphCatalog(async () => new Response('{}', { status: 404 }), true), { state: 'unavailable', compatibility: false })
})

test('source-aware SDK polling rejects its old baseline after an unrelated read consumes the transition notice', async () => {
  let current = publication
  const resolver = sdk.createSubgraphCatalogResolver({ freshMs: 0, url: 'https://catalog.example.invalid', fetch: async () => Response.json(current) })
  globalThis.fetch = async (_url, options) => {
    const ids = JSON.parse(options.body).variables.ids
    return Response.json({ data: { _meta: { deployment: current.deployments[0].deploymentId }, trackingActiveAccounts: ids.map(id => ({ id, deposits: [], borrows: [] })) } })
  }
  const adapter = new AccountAdapter({ subgraphURLs: {}, resolver })
  const account = owner(0)
  const baseline = await adapter.fetchAccountVaultsWithSource(1, account)
  assert.deepEqual(baseline.source, { endpoint, deploymentId: deployedCid })
  await adapter.fetchAccountVaults(1, account)
  current = updateCatalog(current, { ...release, endpoint: endpoint.replace('1.2.3.1/', '1.2.3.2/'), version: '1.2.3.2', deploymentId: 'QmReplacement' }, publicationTime)
  await assert.rejects(adapter.fetchAccountVaults(1, owner(1)), expectReason('source-changed'))
  await adapter.fetchAccountVaults(1, owner(1))
  await assert.rejects(adapter.fetchAccountVaultsWithSource(1, account, { expectedSource: baseline.source }), expectReason('source-changed'))
  const restarted = await adapter.fetchAccountVaultsWithSource(1, account)
  assert.equal(restarted.source.deploymentId, 'QmReplacement')
})

function owner(index) { return '0x' + BigInt(index + 1).toString(16).padStart(38, '0') + '00' }
const vault = '0x' + '3'.repeat(40)
const passThrough = (_name, fn) => fn
for (const [name, Accounts, Factories] of [['Lite installed SDK', InstalledAccountAdapter, InstalledFactoryAdapter], ['current SDK source', AccountAdapter, FactoryAdapter]]) {
  test(`Lite checked wrapper composes with ${name} for 1001 owners and factory reads`, async () => {
    const pageSizes = []
    globalThis.fetch = async (_url, options) => {
      const { query, variables: { ids } } = JSON.parse(options.body)
      const first = Number(query.match(/first:\s*(\d+)/)?.[1] ?? 100)
      const data = query.includes('trackingActiveAccounts')
        ? { trackingActiveAccounts: ids.slice(0, first).map(id => ({ id, deposits: [id + '00' + vault.slice(2)], borrows: [] })) }
        : { vaults: ids.slice(0, first).map(id => ({ id, factory: vault })) }
      if (data.trackingActiveAccounts) pageSizes.push(ids.length)
      return Response.json({ data: { _meta: { deployment: deployedCid, block: { number: checkpointNumber } }, ...data } }, { headers: { 'x-subgraph-source': 'same-source' } })
    }
    const wrapper = checked.withCheckedSubgraphQueries(passThrough, { 1: '/fixture/accounts' })
    const accounts = new Accounts({ subgraphURLs: { 1: '/fixture/accounts' } }, wrapper)
    const owners = Array.from({ length: 1001 }, (_, i) => owner(i))
    const values = await Promise.all(owners.map(account => accounts.fetchAccountVaults(1, account)))
    assert.deepEqual(pageSizes, [1000, 1])
    values.forEach((value, i) => {
      assert.deepEqual(Object.keys(value).map(key => key.toLowerCase()), [owners[i]])
      assert.deepEqual(Object.values(value)[0].deposits, [vault])
    })
    const factories = new Factories({ subgraphURLs: { 1: '/fixture/accounts' } }, wrapper)
    assert.deepEqual(await factories.fetchVaultFactories(1, [owner(0)]), [{ id: owner(0), factory: vault }])
  })
}

test('Lite rejects a catalog source replacement between account pages, including through the current SDK', async () => {
  let current = publication
  const resolveLite = makeLite(current, { now: () => Date.now(), fetchCatalog: async () => current })
  let page = 0
  globalThis.fetch = async (_url, options) => {
    page++
    const ids = JSON.parse(options.body).variables.ids
    return Response.json({ data: { _meta: { deployment: page === 1 ? deployedCid : 'QmReplacement', block: { number: checkpointNumber } }, trackingActiveAccounts: ids.map(id => ({ id, deposits: [], borrows: [] })) } }, { headers: { 'x-subgraph-source': page === 1 ? 'first' : 'second' } })
  }
  const selectedSource = await resolveLite(1)
  const wrapper = checked.withCheckedSubgraphQueries(passThrough, async () => ({ endpoint: '/fixture/transition', identity: selectedSource.identity }))
  const adapter = new AccountAdapter({ subgraphURLs: { 1: '/fixture/transition' } }, wrapper)
  const results = await Promise.allSettled(Array.from({ length: 1001 }, (_, i) => adapter.fetchAccountVaults(1, owner(i))))
  assert.equal(page, 2)
  assert.ok(results.every(result => result.status === 'rejected' && /source changed/i.test(result.reason.message)))
})
