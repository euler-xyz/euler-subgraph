import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runCatalogCommand } from '../../scripts/catalog/command.mjs'
import { writeBuildReceipt } from '../../scripts/catalog/receipt.mjs'

const secret = 'credential-that-must-not-be-logged'
const config = { chainId: 1, network: 'mainnet', startBlock: 10, eVaultFactory: '0x111', eulerEarnFactory: '0x222' }
const manifest = { dataSources: [config.eVaultFactory, config.eulerEarnFactory].map(address => ({ network: 'mainnet', source: { address, startBlock: 10 }, mapping: { file: 'mapping.wasm' } })) }
const endpoint = 'https://api.goldsky.com/api/public/project_fixture/subgraphs/euler-simple-mainnet/1.2.3/gn'
const hash = `0x${'1'.repeat(64)}`
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
async function commandFixture(fn) {
  const directory = mkdtempSync(join(tmpdir(), 'catalog-command-')), root = join(directory, 'source'), remote = join(directory, 'remote.git')
  mkdirSync(root)
  try {
    git(root, 'init', '--quiet')
    git(directory, 'init', '--bare', '--quiet', remote)
    writeFileSync(join(root, '.gitignore'), readFileSync(new URL('../../.gitignore', import.meta.url)))
    writeFileSync(join(root, 'source.ts'), 'reviewed source')
    git(root, 'add', '.')
    git(root, '-c', 'user.name=Test', '-c', 'user.email=test@example.com', '-c', 'commit.gpgsign=false', 'commit', '-qm', 'Fixture source')
    mkdirSync(join(root, 'build'))
    writeFileSync(join(root, 'build/subgraph.yaml'), JSON.stringify(manifest))
    writeFileSync(join(root, 'build/mapping.wasm'), 'compiled mapping')
    await writeBuildReceipt({ root, network: 'mainnet', config, parseManifest: JSON.parse })
    const receiptPath = join(root, '.catalog/mainnet.json')
    const invoke = async (overrides = {}) => {
      const lines = []
      const output = Object.fromEntries(['log', 'warn', 'error'].map(level => [level, message => lines.push({ level, message })]))
      const code = await runCatalogCommand({ root, argv: ['publish', 'mainnet', '1.2.3', 'stable', '100'], networks: { mainnet: config },
        parseManifest: JSON.parse, run: () => endpoint, env: { RPC_URL_1: `https://rpc.example.com/${secret}`, CATALOG_GIT_REMOTE: remote }, ...overrides, output })
      const text = lines.map(line => line.message).join('\n')
      assert.ok(!text.includes(secret), text)
      return { code, lines, text }
    }
    await fn({ root, remote, receiptPath, invoke })
  } finally { rmSync(directory, { recursive: true, force: true }) }
}
const controlledFetch = async (url, options) => {
  if (String(url).includes('rpc.example.com')) {
    const { method } = JSON.parse(options.body)
    return Response.json({ result: method === 'eth_chainId' ? '0x1' : { number: '0x64', hash } })
  }
  if (String(url).includes('api.goldsky.com')) return Response.json({ data: { trackingActiveAccounts: [], vaults: [], _meta: { deployment: 'QmFixture', hasIndexingErrors: false, block: { number: 100, hash } } } })
  if (String(url).endsWith('/QmFixture')) return Response.json({ ...manifest, dataSources: manifest.dataSources.map(row => ({ ...row, mapping: { file: { '/': '/ipfs/QmMapping' } } })) })
  if (String(url).endsWith('/QmMapping')) return new Response('compiled mapping')
  throw new Error(`Unexpected provider URL ${url}`)
}

test('CLI dispatcher exposes safe network, receipt and required configuration errors', async () => commandFixture(async ({ invoke, receiptPath }) => {
  const cases = [
    [{ argv: ['publish', 'unknown', '1.2.3', 'stable', '100'] }, /Unsupported network/],
    [{ networks: { mainnet: { ...config, chainId: undefined } } }, /missing chainId/],
    [{ env: {} }, /Set RPC_URL_<chainId>, CATALOG_GIT_REMOTE and provide checkpoint/],
  ]
  for (const [options, expected] of cases) {
    const result = await invoke(options)
    assert.equal(result.code, 1); assert.match(result.text, expected)
  }
  writeFileSync(receiptPath, JSON.stringify({ network: 'base', chainId: 8453 }))
  let result = await invoke()
  assert.equal(result.code, 1); assert.match(result.text, /Receipt network mismatch/)
  writeFileSync(receiptPath, `${secret} invalid JSON`)
  result = await invoke()
  assert.equal(result.code, 1); assert.match(result.text, /Missing or unreadable build receipt/)
}))

test('CLI publication exposes exact-release validation while preserving the remote', async t => commandFixture(async ({ invoke, remote }) => {
  t.mock.method(globalThis, 'fetch', controlledFetch)
  const result = await invoke({ run: () => '' })
  assert.equal(result.code, 1)
  assert.match(result.text, /Exact release endpoint missing or ambiguous/)
  assert.throws(() => git(remote, 'rev-parse', 'refs/heads/catalog'))
}))

test('CLI suppresses raw fetch, child-process and parser errors, including a spoofed error name', async t => commandFixture(async ({ invoke }) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', controlledFetch)
  for (const error of [new Error(`fetch failed at https://user:${secret}@example.com`), Object.assign(new Error(secret), { name: 'CatalogValidationError' }), { message: secret }]) {
    fetchMock.mock.mockImplementation(async () => { throw error })
    assert.equal((await invoke()).code, 1)
  }
  fetchMock.mock.mockImplementation(async () => new Response(`${secret} invalid JSON`))
  assert.equal((await invoke()).code, 1)
  fetchMock.mock.mockImplementation(controlledFetch)
  const result = await invoke({ run: () => { throw Object.assign(new Error(`command failed: ${secret}`), { stdout: secret, stderr: secret }) } })
  assert.equal(result.code, 1)
  assert.match(result.text, /Catalog publication failed or is unconfirmed/)
  const gitFailure = await invoke({ env: { RPC_URL_1: `https://rpc.example.com/${secret}`, CATALOG_GIT_REMOTE: `/absent/${secret}/remote.git` } })
  assert.equal(gitFailure.code, 1); assert.match(gitFailure.text, /Cannot read publication branch/)
  const credentialRemote = await invoke({ env: { RPC_URL_1: `https://rpc.example.com/${secret}`, CATALOG_GIT_REMOTE: `https://user:${secret}@example.com/repo.git` } })
  assert.equal(credentialRemote.code, 1); assert.match(credentialRemote.text, /Use Git credential helpers/)
}))

test('CLI receipt errors remain nonfatal, clear stale evidence and describe the continuing deploy flow', async () => commandFixture(async ({ invoke, receiptPath }) => {
  const result = await invoke({ argv: ['receipt', 'mainnet'], parseManifest: () => { throw new Error(secret) } })
  assert.equal(result.code, 0)
  assert.equal(existsSync(receiptPath), false)
  assert.match(result.text, /Catalog receipt failed/)
  assert.match(result.text, /Build remains usable for manual deployment/)
  assert.doesNotMatch(result.text, /no deployment or promotion was performed/)
}))

test('CLI receipt rejects unsafe network paths without deleting files outside the receipt directory', async () => commandFixture(async ({ root, invoke }) => {
  const sentinel = join(root, 'source.json')
  writeFileSync(sentinel, 'retained file')
  const result = await invoke({ argv: ['receipt', '../source'] })
  assert.equal(result.code, 0); assert.match(result.text, /Unsupported network/)
  assert.equal(readFileSync(sentinel, 'utf8'), 'retained file')
}))

test('CLI receipt records clean builds and explains dirty builds without preventing deployment', async () => commandFixture(async ({ root, invoke, receiptPath }) => {
  let result = await invoke({ argv: ['receipt', 'mainnet'] })
  assert.equal(result.code, 0); assert.match(result.text, /receipt recorded locally/)
  writeFileSync(join(root, 'source.ts'), 'uncommitted source')
  result = await invoke({ argv: ['receipt', 'mainnet'] })
  assert.equal(result.code, 0); assert.match(result.text, /source tree has uncommitted files/)
  assert.match(result.text, /Build remains usable for manual deployment/)
  assert.equal(existsSync(receiptPath), false)
}))

test('CLI promotion separates safe preflight errors from unconfirmed tag outcomes', async t => commandFixture(async ({ invoke, remote }) => {
  t.mock.method(globalThis, 'fetch', controlledFetch)
  const argv = ['promote', 'mainnet', '1.2.3', 'stable', '100']
  let tags = 0
  let result = await invoke({ argv, run: () => '' })
  assert.equal(result.code, 1)
  assert.match(result.text, /Promotion preflight failed; no tag was changed/)
  assert.match(result.text, /Exact release endpoint missing or ambiguous/)
  result = await invoke({ argv, run: (program, args) => {
    assert.equal(program, 'goldsky')
    if (args[1] === 'list') return endpoint
    assert.deepEqual(args, ['subgraph', 'tag', 'create', 'euler-simple-mainnet/1.2.3', '--tag', 'latest'])
    tags++; throw new Error(secret)
  } })
  assert.equal(result.code, 1); assert.equal(tags, 1)
  assert.match(result.text, /Promotion outcome unconfirmed/)
  assert.doesNotMatch(result.text, /no tag was changed/)
  assert.throws(() => git(remote, 'rev-parse', 'refs/heads/catalog'))
}))

test('CLI post-promotion publication failures preserve safe validation detail and require publish-only retry', async t => commandFixture(async ({ invoke, remote }) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', controlledFetch)
  let tags = 0
  for (const rawProviderFailure of [false, true]) {
    fetchMock.mock.mockImplementation(async (url, options) => {
      if (String(url).includes('/latest/')) {
        if (rawProviderFailure) throw new Error(secret)
        return Response.json({ data: { trackingActiveAccounts: [], vaults: [], _meta: { deployment: 'wrongCID', hasIndexingErrors: false, block: { number: 100, hash } } } })
      }
      return controlledFetch(url, options)
    })
    const result = await invoke({ argv: ['promote', 'mainnet', '1.2.3', 'stable', '100'], run: (_program, args) => {
      if (args[1] === 'list') return endpoint
      tags++; return ''
    } })
    assert.equal(result.code, 1)
    assert.match(result.text, /Promotion succeeded; catalog publication failed or is unconfirmed/)
    assert.match(result.text, /Retry catalog:publish without retagging/)
    assert.doesNotMatch(result.text, /no tag was changed|Goldsky was not changed/)
    if (!rawProviderFailure) assert.match(result.text, /Selected deployment is not the promoted latest alias/)
    assert.throws(() => git(remote, 'rev-parse', 'refs/heads/catalog'))
  }
  assert.equal(tags, 2)
}))

test('CLI retirement failures direct operators to retry retirement, not publication', async () => commandFixture(async ({ invoke }) => {
  const result = await invoke({ argv: ['retire', 'mainnet', 'stable'], env: {} })
  assert.equal(result.code, 1)
  assert.match(result.text, /Provide retirement channel and CATALOG_GIT_REMOTE/)
  assert.match(result.text, /Retry catalog:retire/)
  assert.doesNotMatch(result.text, /Retry catalog:publish/)
}))
