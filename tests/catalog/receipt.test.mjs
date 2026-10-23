import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { writeBuildReceipt } from '../../scripts/catalog/receipt.mjs'
import { fingerprintManifest, validateRelease } from '../../scripts/catalog/validate.mjs'
const config = { chainId: 1, network: 'mainnet', startBlock: 10, eVaultFactory: '0x111', eulerEarnFactory: '0x222' }
const manifest = startBlock => ({ dataSources: [config.eVaultFactory, config.eulerEarnFactory].map(address => ({ network: 'mainnet', source: { address, startBlock }, mapping: { file: 'mapping.wasm' } })), schema: { file: 'schema.graphql' } })
async function cleanBuild(fn) {
  const root = mkdtempSync(join(tmpdir(), 'catalog-receipt-'))
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  try {
    git('init', '--quiet')
    writeFileSync(join(root, '.gitignore'), readFileSync(new URL('../../.gitignore', import.meta.url)))
    writeFileSync(join(root, 'source.ts'), 'reviewed source')
    git('add', '.'); git('-c', 'user.name=Test', '-c', 'user.email=test@example.com', '-c', 'commit.gpgsign=false', 'commit', '-qm', 'Fixture source')
    mkdirSync(join(root, 'build'))
    writeFileSync(join(root, 'build/mapping.wasm'), 'compiled mapping')
    writeFileSync(join(root, 'build/schema.graphql'), 'compiled schema')
    const writeManifest = value => writeFileSync(join(root, 'build/subgraph.yaml'), JSON.stringify(value)) // JSON is also valid YAML.
    writeManifest(manifest(10))
    await fn({ root, git, writeManifest, receiptPath: join(root, '.catalog/mainnet.json'), options: { root, network: 'mainnet', config, parseManifest: JSON.parse } })
  } finally { rmSync(root, { recursive: true, force: true }) }
}
test('clean committed build produces exact artifact/source provenance; dirty rebuild clears receipt', async () => cleanBuild(async ({ root, git, options, receiptPath }) => {
  const { receipt, status } = await writeBuildReceipt(options)
  assert.equal(status, 'written'); assert.equal(receipt.sourceCommit, git('rev-parse', 'HEAD')); assert.equal(receipt.startBlock, 10)
  assert.deepEqual(JSON.parse(readFileSync(receiptPath)), receipt)
  assert.equal(receipt.manifestFingerprint, await fingerprintManifest(manifest(10), file => readFileSync(join(root, 'build', file))))
  writeFileSync(join(root, 'source.ts'), 'uncommitted source')
  assert.equal((await writeBuildReceipt(options)).status, 'dirty'); assert.equal(existsSync(receiptPath), false)
}))
test('operator inventory and hotfix JSON do not dirty receipts, while other untracked source still does', async () => cleanBuild(async ({ root, options, receiptPath }) => {
  mkdirSync(join(root, 'hotfix'))
  writeFileSync(join(root, 'deployments.json'), JSON.stringify([{ network: 'mainnet', version: '1.2.3' }]))
  writeFileSync(join(root, 'hotfix/mainnet-1.2.3.json'), JSON.stringify({ chain: 'mainnet', baseVersion: '1.2.3', deploymentId: '' }))
  assert.equal((await writeBuildReceipt(options)).status, 'written')
  // The hotfix script records the resolved deployment ID before building.
  writeFileSync(join(root, 'hotfix/mainnet-1.2.3.json'), JSON.stringify({ chain: 'mainnet', baseVersion: '1.2.3', deploymentId: 'QmBaseCID' }))
  assert.equal((await writeBuildReceipt(options)).status, 'written')
  writeFileSync(join(root, 'hotfix/source.ts'), 'unreviewed source')
  assert.equal((await writeBuildReceipt(options)).status, 'dirty')
  assert.equal(existsSync(receiptPath), false)
  rmSync(join(root, 'hotfix/source.ts'))
  mkdirSync(join(root, 'nested'))
  writeFileSync(join(root, 'nested/deployments.json'), '[]')
  assert.equal((await writeBuildReceipt(options)).status, 'dirty')
}))
test('grafted clean build records compiled start block, source commit and exact graft/artifact fingerprint', async () => cleanBuild(async ({ root, git, options, writeManifest }) => {
  const compiled = { ...manifest(101), features: ['grafting'], graft: { base: 'QmBaseCID', block: 100 } }
  writeManifest(compiled)
  const { receipt } = await writeBuildReceipt(options)
  assert.equal(receipt.startBlock, 101); assert.equal(receipt.sourceCommit, git('rev-parse', 'HEAD'))
  assert.equal(receipt.manifestFingerprint, await fingerprintManifest(compiled, file => readFileSync(join(root, 'build', file))))
  const hash = `0x${'1'.repeat(64)}`
  const probes = { inventory: async () => 'https://api.goldsky.com/api/public/project_fixture/subgraphs/euler-simple-mainnet/1.2.3.1/gn',
    graphql: async () => ({ deployment: 'QmGraftCID', hasIndexingErrors: false, block: { number: 200, hash } }),
    chainCheckpoint: async () => ({ chainId: 1, number: 200, hash }), manifest: async () => compiled, artifact: async file => readFileSync(join(root, 'build', file)) }
  const selection = { version: '1.2.3.1', channel: 'stable', checkpoint: 200 }
  assert.equal((await validateRelease(selection, receipt, probes)).startBlock, 101)
  await assert.rejects(validateRelease(selection, receipt, { ...probes, artifact: async () => Buffer.from('different build') }))
  await assert.rejects(validateRelease(selection, receipt, { ...probes, manifest: async () => ({ ...compiled, graft: { ...compiled.graft, base: 'QmOtherBase' } }) }))
}))
test('invalid graft configurations clear prior receipt', async () => cleanBuild(async ({ options, writeManifest, receiptPath }) => {
  const invalid = [
    { ...manifest(101), graft: { base: 'QmCID', block: 100 } },
    { ...manifest(101), features: ['grafting'], graft: { base: '', block: 100 } },
    { ...manifest(101), features: ['grafting'], graft: { base: 'QmCID', block: -1 } },
    { ...manifest(101), features: ['grafting'], graft: { base: 'QmCID', block: Number.MAX_SAFE_INTEGER } },
    { ...manifest(101), features: ['grafting'], graft: { base: 'QmCID', block: 100.5 } },
    { ...manifest(101), features: ['grafting'], graft: { base: 'QmCID', block: 9 } },
    { ...manifest(10), features: ['grafting'], graft: { base: 'QmCID', block: 100 } },
    { ...manifest(10), features: ['grafting'] },
  ]
  for (const bad of invalid) {
    writeManifest(manifest(10)); await writeBuildReceipt(options); assert.ok(existsSync(receiptPath))
    writeManifest(bad); await assert.rejects(writeBuildReceipt(options)); assert.equal(existsSync(receiptPath), false)
  }
}))
test('scope mismatch, unreadable artifacts and symlink escape clear prior receipt', async () => cleanBuild(async ({ root, options, writeManifest, receiptPath }) => {
  await writeBuildReceipt(options)
  const wrong = manifest(10); wrong.dataSources[0].source.address = '0x333'; writeManifest(wrong)
  await assert.rejects(writeBuildReceipt(options)); assert.equal(existsSync(receiptPath), false)
  writeManifest(manifest(10)); await writeBuildReceipt(options)
  rmSync(join(root, 'build/mapping.wasm'))
  await assert.rejects(writeBuildReceipt(options)); assert.equal(existsSync(receiptPath), false)
  symlinkSync(join(root, 'source.ts'), join(root, 'build/mapping.wasm'))
  await assert.rejects(writeBuildReceipt(options), /outside build/); assert.equal(existsSync(receiptPath), false)
}))
