import test from 'node:test'
import assert from 'node:assert/strict'
import { createGoldskyReader, validateImportedRelease } from '../../scripts/catalog/import.mjs'
import { createCheckpointProbes } from '../../scripts/catalog/probes.mjs'
import { validRecord } from '../../scripts/catalog/catalog.mjs'

const secret = 'project-credential-must-stay-private'
const endpoint = 'https://api.goldsky.com/api/public/project_fixture/subgraphs/euler-simple-base/1.0.1/gn'
const hash = `0x${'a'.repeat(64)}`, cid = 'QmDeployment'
const config = { network: 'base', chainId: 8453, sourceCommit: 'f'.repeat(40), startBlock: 9999999 }
const selection = { version: '1.0.1', channel: 'stable', checkpoint: 100 }
const meta = { deployment: cid, hasIndexingErrors: false, block: { number: 100, hash } }
const row = (version = '1.0.1') => ({ name: 'euler-simple-base', version, network: 'base', status: 'ACTIVE', public_endpoint_enabled: true,
  graphql_endpoint: endpoint.replace('/1.0.1/', `/${version}/`), deployments: [{ deployment_id: cid }], ...(version === 'latest' ? { tag: { target_version: '1.0.1' } } : {}) })
const body = (...data) => ({ data, pagination: { next_page_token: null, page_size: data.length } })
const reader = (data, calls = []) => createGoldskyReader({ apiKey: secret, fetchImpl: async (url, options) => { calls.push({ url, options }); return Response.json(data) } })
const evidence = () => ({
  chainCheckpoint: async () => ({ chainId: 8453, number: 100, hash }),
  release: async (_network, version) => reader(body(row(version)))('base', version),
  graphql: async () => meta,
})

test('Goldsky API exact selection ignores tag ordering and carries credentials only on fixed-origin GETs', async () => {
  const calls = []
  const result = await reader(body(row('latest'), row()), calls)('base', '1.0.1')
  assert.deepEqual(result, { endpoint, deploymentId: cid })
  assert.equal(calls[0].url, 'https://api.goldsky.com/api/v1/subgraphs/euler-simple-base/1.0.1')
  assert.equal(calls[0].options.method, 'GET')
  assert.equal(calls[0].options.headers.authorization, `Bearer ${secret}`)
  assert.equal(calls[0].options.redirect, 'error')
  assert.ok(calls[0].options.signal)
  assert.equal(calls[0].options.body, undefined)
  await assert.rejects(reader(body(row()))('../base', '1.0.1'))
  await assert.rejects(reader(body(row()))('base', '1.0.1/../../other'))
  assert.throws(() => createGoldskyReader({ apiKey: '' }), /GOLDSKY_API_KEY/)
})

test('API rejects missing, duplicate, incomplete, private or wrong-network/version deployment metadata', async () => {
  const bad = [body(), body(row(), row()), { ...body(row()), pagination: { next_page_token: 'more' } }, { data: [row()] },
    ...[{ network: 'mainnet' }, { status: 'PAUSED' }, { public_endpoint_enabled: false }, { name: 'euler-simple-base-test' },
      { tag: { target_version: '1.0.1' } }, { deployments: [] }, { deployments: [{ deployment_id: '' }] },
      { deployments: [{ deployment_id: cid }, { deployment_id: 'another' }] },
      { graphql_endpoint: endpoint.replace('api.goldsky.com', 'evil.example') },
      { graphql_endpoint: endpoint.replace('/1.0.1/', '/1x0x1/') }, { graphql_endpoint: endpoint + '?token=x' },
      { graphql_endpoint: endpoint.replace('https://', 'https://user:password@') },
    ].map(change => body({ ...row(), ...change }))]
  for (const value of bad) await assert.rejects(reader(value)('base', '1.0.1'))
})

test('API stream is cancelled at the byte budget without buffering the remainder', async () => {
  let pulls = 0, cancelled = false
  const stream = new ReadableStream({ pull(controller) { pulls++; controller.enqueue(new Uint8Array(600_000)) }, cancel() { cancelled = true } }, { highWaterMark: 0 })
  const read = createGoldskyReader({ apiKey: secret, fetchImpl: async () => new Response(stream) })
  await assert.rejects(read('base', '1.0.1'), /too large/)
  assert.equal(pulls, 2); assert.equal(cancelled, true)
})

test('import binds API CID, selected and latest queries to the trusted chain checkpoint and omits all build claims', async () => {
  const calls = []
  const probes = createCheckpointProbes({ rpc: 'https://rpc.example', request: async (url, query) => {
    calls.push({ url, query })
    return Buffer.from(JSON.stringify(query.method ? { result: query.method === 'eth_chainId' ? '0x2105' : { number: '0x64', hash } }
      : { data: { _meta: meta, trackingActiveAccounts: [], vaults: [] } }))
  } })
  const result = await validateImportedRelease(selection, config, { ...evidence(), ...probes })
  assert.deepEqual(result, { chainId: 8453, family: 'euler-simple', channel: 'stable', status: 'active', version: '1.0.1', endpoint, deploymentId: cid, capabilities: ['account-vault-discovery', 'vault-factory-lookup'] })
  assert.equal(validRecord(result), true)
  assert.deepEqual(calls.slice(0, 2).map(call => call.query.method), ['eth_chainId', 'eth_getBlockByNumber'])
  assert.equal(calls.length, 4)
  for (const call of calls.slice(2)) {
    assert.equal((call.query.query.match(/hash:/g) ?? []).length, 3)
    assert.ok(!JSON.stringify(call).includes(secret))
  }
  assert.equal(calls[3].url, endpoint.replace('/1.0.1/', '/latest/'))
})

test('import does not bypass chain, checkpoint, CID, indexing, capabilities or promotion checks', async () => {
  for (const chainId of [1, undefined]) await assert.rejects(validateImportedRelease(selection, config, { ...evidence(), chainCheckpoint: async () => ({ chainId, number: 100, hash }) }))
  for (const checkpoint of [-1, NaN, 100.1, Number.MAX_SAFE_INTEGER + 1]) await assert.rejects(validateImportedRelease({ ...selection, checkpoint }, config, evidence()))
  for (const target of ['selected', 'latest']) {
    for (const observation of [null, { ...meta, deployment: 'wrong' }, { ...meta, hasIndexingErrors: true }, { ...meta, block: { number: 99, hash } }, { ...meta, block: { number: 100, hash: null } }]) {
      await assert.rejects(validateImportedRelease(selection, config, { ...evidence(), graphql: async url => url.includes('/latest/') === (target === 'latest') ? observation : meta }))
    }
  }
  for (const change of [{ targetVersion: '1.0.2' }, { deploymentId: 'wrong' }, { endpoint: endpoint.replace('project_fixture', 'project_other').replace('/1.0.1/', '/latest/') }]) {
    const probes = evidence(), read = probes.release
    probes.release = async (network, version) => ({ ...await read(network, version), ...(version === 'latest' ? change : {}) })
    await assert.rejects(validateImportedRelease(selection, config, probes), /latest alias/)
  }
  const probes = createCheckpointProbes({ rpc: 'https://rpc.example', request: async () => Buffer.from(JSON.stringify({ data: { _meta: meta, trackingActiveAccounts: [], vaults: null } })) })
  await assert.rejects(validateImportedRelease(selection, config, { ...evidence(), graphql: probes.graphql }), /capabilities/)
})

test('candidate import neither requires nor changes the latest alias', async () => {
  const probes = evidence(), read = probes.release, calls = []
  probes.release = async (network, version) => { calls.push(version); return read(network, version) }
  assert.equal((await validateImportedRelease({ ...selection, channel: 'candidate' }, config, probes)).channel, 'candidate')
  assert.deepEqual(calls, ['1.0.1'])
})

test('omitted build fields are valid but malformed supplied values remain invalid', () => {
  const active = { chainId: 8453, family: 'euler-simple', channel: 'stable', status: 'active', version: '1.0.1', endpoint, deploymentId: cid, capabilities: ['account-vault-discovery', 'vault-factory-lookup'] }
  assert.equal(validRecord(active), true)
  for (const change of [{ sourceCommit: null }, { sourceCommit: 'short' }, { startBlock: null }, { startBlock: -1 }, { startBlock: '0' }, { interfacesCommit: ['a'.repeat(40)] }]) assert.equal(validRecord({ ...active, ...change }), false)
})


test('deployment slugs remain distinct from Graph network aliases', async () => {
  for (const [network, graphNetwork] of [['arbitrum', 'arbitrum-one'], ['berachain', 'berachain-mainnet'], ['plasma', 'plasma-mainnet'], ['polygon', 'matic'], ['gnosis', 'xdai']]) {
    const metadata = { ...row(), name: `euler-simple-${network}`, network: graphNetwork, graphql_endpoint: endpoint.replace('euler-simple-base', `euler-simple-${network}`) }
    const read = reader(body(metadata))
    assert.equal((await read(network, '1.0.1', graphNetwork)).endpoint, metadata.graphql_endpoint)
    await assert.rejects(read(network, '1.0.1', 'wrong-network'))
    const args = []
    const result = await validateImportedRelease({ ...selection, channel: 'candidate' }, { network, graphNetwork, chainId: 8453 }, {
      ...evidence(), release: async (...values) => { args.push(values); return read(...values) },
    })
    assert.deepEqual(args, [[network, '1.0.1', graphNetwork]])
    assert.equal(result.endpoint, metadata.graphql_endpoint)
  }
})
