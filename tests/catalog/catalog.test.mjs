import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseCatalog, resolveCatalog, updateCatalog } from '../../scripts/catalog/catalog.mjs'
import { selectEndpoint, fingerprintManifest, manifestScope, validateRelease } from '../../scripts/catalog/validate.mjs'
const fixture = JSON.parse(readFileSync(new URL('../../catalog/fixture.v1.json', import.meta.url)))
const active = fixture.deployments[0]
const manifest = { dataSources: [{ network: 'mainnet', source: { address: '0x123', startBlock: 10 }, mapping: { file: './mapping.wasm' } }], schema: { file: './schema.graphql' } }
const bytes = async file => Buffer.from(file.includes('schema') ? 'schema' : 'mapping')
async function evidence() {
  const receipt = { schemaVersion: 1, network: 'mainnet', name: 'euler-simple-mainnet', chainId: 1, sourceCommit: 'a'.repeat(40), startBlock: 10,
    scope: manifestScope(manifest), manifestFingerprint: await fingerprintManifest(manifest, bytes) }
  const observation = { deployment: 'QmCID', hasIndexingErrors: false, block: { number: 100, hash: `0x${'1'.repeat(64)}` } }
  const probes = { inventory: async () => active.endpoint, graphql: async () => observation, manifest: async () => manifest, artifact: bytes,
    chainCheckpoint: async () => ({ chainId: 1, hash: observation.block.hash }) }
  return { receipt, probes, observation, selection: { version: '1.2.3.1', channel: 'stable', checkpoint: 100 } }
}
test('producer fixture parses and retires authoritatively', () => {
  const parsed = parseCatalog(fixture)
  assert.equal(parsed.diagnostics.length, 0)
  assert.equal(resolveCatalog(parsed, 1, 'account-vault-discovery').status, 'active')
  assert.equal(resolveCatalog(parsed, 8453, 'account-vault-discovery').status, 'retired')
  assert.equal(resolveCatalog(parsed, 10, 'account-vault-discovery').status, 'missing')
  assert.equal(resolveCatalog(parsed, 1, 'unknown').status, 'unsupported-capability')
  assert.equal(resolveCatalog(parsed, 1, 'account-vault-discovery', 'candidate').status, 'missing')
})
test('invalid and duplicate identities are quarantined without poisoning other chains', () => {
  for (const bad of [{ ...active, endpoint: 'https://user:secret@example.com' }, active, { ...active, startBlock: -1 }]) {
    const parsed = parseCatalog({ ...fixture, deployments: [...fixture.deployments, bad] })
    assert.equal(resolveCatalog(parsed, 1, 'account-vault-discovery').status, 'invalid')
    assert.equal(resolveCatalog(parsed, 8453, 'account-vault-discovery').status, 'retired')
    assert.throws(() => updateCatalog(parsed.catalog, active))
  }
})
test('envelopes fail closed; other family/channel never select as stable', () => {
  for (const change of [{ schemaVersion: 2 }, { publishedAt: 'yesterday' }, { revision: '' }, { deployments: {} }]) assert.throws(() => parseCatalog({ ...fixture, ...change }))
  const parsed = parseCatalog({ ...fixture, deployments: [{ ...active, family: 'other' }, { ...active, channel: 'candidate' }] })
  assert.equal(resolveCatalog(parsed, 1, 'account-vault-discovery').status, 'missing')
})
test('exact release selection excludes test forks and respects all hotfix components', () => {
  const testUrl = active.endpoint.replace('mainnet/', 'mainnet-test/')
  const next = active.endpoint.replace('1.2.3.1/', '1.2.3.9/')
  assert.equal(selectEndpoint(`${testUrl}\n${next}\n${active.endpoint}`, 'euler-simple-mainnet', '1.2.3.1'), active.endpoint)
  assert.throws(() => selectEndpoint(testUrl, 'euler-simple-mainnet', '1.2.3.1'))
  assert.throws(() => selectEndpoint(`${active.endpoint}\n${active.endpoint.replace('project_fixture', 'other')}`, 'euler-simple-mainnet', '1.2.3.1'))
  assert.throws(() => selectEndpoint(next, 'euler-simple-mainnet', '1.2.3'))
})
test('validated release has truthful source, immutable endpoint and observed CID', async () => {
  const { receipt, probes, selection } = await evidence()
  const row = await validateRelease(selection, receipt, probes)
  assert.equal(row.deploymentId, 'QmCID'); assert.equal(row.sourceCommit, receipt.sourceCommit)
  assert.equal(row.endpoint, active.endpoint); assert.equal(row.interfacesCommit, undefined)
})
test('provider, indexing, chain, artifact, scope and promotion mismatches block publication', async () => {
  const cases = [
    { inventory: async () => { throw new Error('provider failed') } },
    { graphql: async () => ({ deployment: 'CID', hasIndexingErrors: true }) },
    { chainCheckpoint: async () => ({ chainId: 10, hash: `0x${'1'.repeat(64)}` }) },
    { chainCheckpoint: async () => ({ chainId: 1, hash: `0x${'2'.repeat(64)}` }) },
    { artifact: async () => Buffer.from('wrong build') },
    { manifest: async () => ({ ...manifest, dataSources: [{ ...manifest.dataSources[0], network: 'wrong' }] }) },
  ]
  for (const change of cases) {
    const { receipt, probes, selection } = await evidence()
    await assert.rejects(validateRelease(selection, receipt, { ...probes, ...change }))
  }
  const { receipt, probes, selection, observation } = await evidence()
  await assert.rejects(validateRelease(selection, receipt, { ...probes, graphql: async endpoint => ({ ...observation, deployment: endpoint.includes('/latest/') ? 'wrong' : 'QmCID' }) }))
  await assert.rejects(validateRelease({ ...selection, checkpoint: 101 }, receipt, probes))
})
test('candidate validation does not demand or move stable alias', async () => {
  const { receipt, probes, selection, observation } = await evidence()
  let calls = 0
  const row = await validateRelease({ ...selection, channel: 'candidate' }, receipt, { ...probes, graphql: async endpoint => { calls++; assert.ok(!endpoint.includes('/latest/')); return observation } })
  assert.equal(calls, 1); assert.equal(row.channel, 'candidate')
})
test('manifest fingerprint resolves IPFS links and includes every artifact', async () => {
  const deployed = structuredClone(manifest)
  deployed.schema.file = { '/': '/ipfs/schemaCID' }
  deployed.dataSources[0].mapping.file = { '/': '/ipfs/mappingCID' }
  assert.equal(await fingerprintManifest(manifest, bytes), await fingerprintManifest(deployed, bytes))
})
