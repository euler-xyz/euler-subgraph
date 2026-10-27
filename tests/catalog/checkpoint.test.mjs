import test from 'node:test'
import assert from 'node:assert/strict'
import { createCheckpointProbes } from '../../scripts/catalog/probes.mjs'
import { fingerprintManifest, manifestScope, validateRelease } from '../../scripts/catalog/validate.mjs'

const rpc = 'https://rpc.example.test'
const endpoint = 'https://api.goldsky.com/api/public/project_fixture/subgraphs/euler-simple-base/1.2.3.1/gn'
const hash = `0x${'a1'.repeat(32)}`
const checkpoint = { chainId: 8453, number: 100, hash }
const selection = { version: '1.2.3.1', channel: 'stable', checkpoint: checkpoint.number }
const meta = { deployment: 'QmCID', hasIndexingErrors: false, block: { number: checkpoint.number, hash } }
const encode = value => new TextEncoder().encode(JSON.stringify(value))

async function evidence({ chainId = '0x2105', block = { number: '0x64', hash }, observation = value => value, capabilities = {}, rpcError } = {}) {
  const calls = []
  const request = async (url, body) => {
    calls.push({ url, body })
    if (url === rpc) return encode(rpcError ? { error: rpcError } : { result: body.method === 'eth_chainId' ? chainId : block })
    // Graph Node's numeric-block metadata has a null hash; a hash-bound query resolves it.
    const numeric = /block:\s*\{\s*number:/.test(body.query)
    return encode({ data: { _meta: observation({ ...meta, block: { ...meta.block, hash: numeric ? null : hash } }, url), trackingActiveAccounts: [], vaults: [], ...capabilities } })
  }
  const manifest = { dataSources: [{ network: 'base', source: { address: '0x123', startBlock: 10 }, mapping: { file: 'mapping' } }] }
  const artifact = async () => Buffer.from('controlled artifact')
  const receipt = { schemaVersion: 1, name: 'euler-simple-base', network: 'base', chainId: 8453, sourceCommit: 'a'.repeat(40), startBlock: 10,
    scope: manifestScope(manifest), manifestFingerprint: await fingerprintManifest(manifest, artifact) }
  const probes = { ...createCheckpointProbes({ request, rpc }), inventory: async () => endpoint, manifest: async () => manifest, artifact }
  return { probes, receipt, calls, request }
}

test('numeric Graph Node null-hash response is avoided by RPC-first hash-bound metadata and capabilities, including latest', async () => {
  const { receipt, probes, calls, request } = await evidence()
  const numericResponse = JSON.parse(new TextDecoder().decode(await request(endpoint, { query: 'query { _meta(block: {number: 100}) { block { number hash } } }' })))
  assert.equal(numericResponse.data._meta.block.hash, null)
  calls.length = 0
  const record = await validateRelease(selection, receipt, probes)
  assert.equal(record.deploymentId, 'QmCID')
  assert.equal(record.endpoint, endpoint)
  assert.deepEqual(calls.slice(0, 2).map(({ body }) => [body.method, body.params]), [['eth_chainId', []], ['eth_getBlockByNumber', ['0x64', false]]])
  const queries = calls.slice(2)
  assert.equal(queries.length, 2)
  assert.equal(queries[0].url, endpoint)
  assert.equal(queries[1].url, endpoint.replace('/1.2.3.1/', '/latest/'))
  for (const { body: { query } } of queries) {
    assert.doesNotMatch(query, /block:\s*\{\s*number:/)
    for (const field of ['_meta', 'trackingActiveAccounts', 'vaults']) {
      assert.match(query, new RegExp(`${field}\\([^)]*block: \\{hash: "${hash}"\\}`))
    }
  }
})

test('invalid, absent and mismatched RPC checkpoint evidence blocks GraphQL probes', async () => {
  const cases = [
    { chainId: '0x1' }, { chainId: '8453' }, { chainId: null }, { chainId: '0x0' }, { chainId: '0x20000000000000' },
    { block: null }, { block: {} }, { block: { number: '0x65', hash } }, { block: { number: '100', hash } },
    { block: { number: 100, hash } }, { block: { number: '0x20000000000000', hash } },
    { block: { number: '0x64', hash: null } }, { block: { number: '0x64', hash: '0x1234' } },
    { rpcError: { code: -32000, message: 'RPC failure' } }
  ]
  for (const options of cases) {
    const { receipt, probes, calls } = await evidence(options)
    await assert.rejects(validateRelease(selection, receipt, probes))
    assert.ok(calls.every(({ url }) => url === rpc))
  }
})

test('invalid operator checkpoints fail before RPC or GraphQL calls', async () => {
  for (const number of [-1, 9, 100.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    const { receipt, probes, calls } = await evidence()
    await assert.rejects(validateRelease({ ...selection, checkpoint: number }, receipt, probes))
    assert.equal(calls.length, 0)
  }
})

test('selected release and latest alias must report the exact RPC number, hash and indexing state', async () => {
  const invalid = [
    undefined, { ...meta, hasIndexingErrors: true }, { ...meta, deployment: 'anotherCID' },
    { ...meta, block: { number: 99, hash } }, { ...meta, block: { number: 101, hash } },
    { ...meta, block: { number: 100, hash: null } }, { ...meta, block: { number: 100, hash: `0x${'b'.repeat(64)}` } },
    { ...meta, block: { number: '100', hash } }
  ]
  for (const target of ['selected', 'latest']) {
    for (const bad of invalid) {
      if (target === 'selected' && bad?.deployment === 'anotherCID') continue
      const { receipt, probes } = await evidence({ observation: (value, url) => url.includes('/latest/') === (target === 'latest') ? bad : value })
      await assert.rejects(validateRelease(selection, receipt, probes))
    }
  }
})

test('required capability failures remain blocking on selected endpoint and alias', async () => {
  for (const capabilities of [{ trackingActiveAccounts: null }, { vaults: null }]) {
    const { receipt, probes } = await evidence({ capabilities })
    await assert.rejects(validateRelease(selection, receipt, probes), /capabilities/)
  }
  const { receipt, probes, request } = await evidence()
  const wrapped = createCheckpointProbes({ rpc, request: async (url, body) => url.includes('/latest/') ? encode({ errors: [{ message: 'field unavailable' }] }) : request(url, body) })
  await assert.rejects(validateRelease(selection, receipt, { ...probes, ...wrapped }), /capabilities/)
})

test('candidate uses the same hash-bound checkpoint without reading latest and RPC hex hashes normalize', async () => {
  const { receipt, probes, calls } = await evidence({ block: { number: '0x64', hash: hash.toUpperCase().replace('0X', '0x') } })
  assert.deepEqual(await probes.chainCheckpoint(100), checkpoint)
  calls.length = 0
  assert.equal((await validateRelease({ ...selection, channel: 'candidate' }, receipt, probes)).channel, 'candidate')
  assert.equal(calls.length, 3)
  assert.equal(calls[2].url, endpoint)
})
