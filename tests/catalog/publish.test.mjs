import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, readFileSync, mkdirSync, writeFileSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { publishCatalog } from '../../scripts/catalog/publish.mjs'
const fixture = JSON.parse(readFileSync(new URL('../../catalog/fixture.v1.json', import.meta.url)))
const active = fixture.deployments[0]
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
async function localRemote(fn) {
  const directory = mkdtempSync(join(tmpdir(), 'catalog-test-'))
  const remote = join(directory, 'remote.git')
  git(directory, 'init', '--bare', '--quiet', remote)
  try { await fn(remote) } finally { rmSync(directory, { recursive: true, force: true }) }
}
const read = remote => JSON.parse(git(remote, 'show', 'refs/heads/catalog:v1/catalog.json'))
test('first publication, idempotent retry, retirement and rollback preserve history and unrelated records', async () => localRemote(async remote => {
  assert.equal((await publishCatalog(remote, async () => active)).status, 'published')
  const first = git(remote, 'rev-parse', 'refs/heads/catalog')
  assert.equal((await publishCatalog(remote, async () => active)).status, 'unchanged')
  assert.equal(git(remote, 'rev-parse', 'refs/heads/catalog'), first)
  await publishCatalog(remote, async () => fixture.deployments[1])
  await publishCatalog(remote, async () => ({ chainId: 1, family: 'euler-simple', channel: 'stable', status: 'retired' }))
  assert.equal(read(remote).deployments.find(row => row.chainId === 1).status, 'retired')
  await publishCatalog(remote, async () => active)
  assert.equal(read(remote).deployments.length, 2)
  assert.equal(git(remote, 'rev-list', '--count', 'refs/heads/catalog'), '4')
}))
test('validation/provider failure leaves published bytes untouched', async () => localRemote(async remote => {
  await publishCatalog(remote, async () => active)
  const first = git(remote, 'rev-parse', 'refs/heads/catalog')
  await assert.rejects(publishCatalog(remote, async () => { throw new Error('provider failed') }))
  assert.equal(git(remote, 'rev-parse', 'refs/heads/catalog'), first)
}))
test('concurrent writers cannot overwrite each other and explicit retry preserves both', async () => localRemote(async remote => {
  await publishCatalog(remote, async () => active)
  const second = { ...active, chainId: 10 }, third = { ...active, chainId: 137 }
  await assert.rejects(publishCatalog(remote, async () => second, { beforePush: async () => { await publishCatalog(remote, async () => third) } }), /conflicted/)
  assert.deepEqual(read(remote).deployments.map(row => row.chainId).sort((a,b) => a-b), [1, 137])
  await publishCatalog(remote, async () => second)
  assert.equal(read(remote).deployments.length, 3)
}))
test('racing initial publishers cannot overwrite initial publication', async () => localRemote(async remote => {
  await assert.rejects(publishCatalog(remote, async () => active, { beforePush: async () => { await publishCatalog(remote, async () => fixture.deployments[1]) } }), /conflicted/)
  assert.equal(read(remote).deployments[0].status, 'retired')
}))
test('unreachable remote fails rather than creating an empty catalog', async () => localRemote(async remote => {
  let observed = false
  await assert.rejects(publishCatalog(`${remote}/absent`, async () => { observed = true; return active }))
  assert.equal(observed, false)
}))

import { promoteAndPublish } from '../../scripts/catalog/promote.mjs'
import { fingerprintManifest, manifestScope, validateRelease } from '../../scripts/catalog/validate.mjs'
async function promotionEvidence() {
  const manifest = { dataSources: [{ network: 'mainnet', source: { address: '0x123', startBlock: 10 }, mapping: { file: 'mapping' } }] }
  const artifact = async () => Buffer.from('controlled artifact')
  const receipt = { schemaVersion: 1, name: 'euler-simple-mainnet', network: 'mainnet', chainId: 1, sourceCommit: active.sourceCommit, startBlock: 10,
    scope: manifestScope(manifest), manifestFingerprint: await fingerprintManifest(manifest, artifact) }
  let promoted = false, tags = 0
  const selection = { version: active.version, channel: 'stable', checkpoint: 100 }
  const hash = `0x${'1'.repeat(64)}`
  const probes = { inventory: async () => active.endpoint, artifact, manifest: async () => manifest, chainCheckpoint: async () => ({ chainId: 1, hash }),
    graphql: async endpoint => ({ deployment: endpoint.includes('/latest/') && !promoted ? 'previousCID' : 'selectedCID', hasIndexingErrors: false, block: { number: 100, hash } }) }
  const tag = async (name, version) => { assert.equal(name, receipt.name); assert.equal(version, active.version); tags++; promoted = true }
  return { receipt, selection, probes, tag, tags: () => tags }
}
test('operator promotion validates candidate, tags exactly once and publishes stable', async () => localRemote(async remote => {
  const e = await promotionEvidence()
  const result = await promoteAndPublish(e.selection, e.receipt, e.probes, remote, e.tag)
  assert.equal(result.status, 'published'); assert.equal(e.tags(), 1)
  assert.equal(read(remote).deployments[0].channel, 'stable')
}))
test('preflight failure never tags; ambiguous tag failure never publishes', async () => localRemote(async remote => {
  const e = await promotionEvidence()
  await assert.rejects(promoteAndPublish(e.selection, e.receipt, { ...e.probes, inventory: async () => '' }, remote, e.tag))
  assert.equal(e.tags(), 0)
  await assert.rejects(promoteAndPublish(e.selection, e.receipt, e.probes, remote, async () => { throw new Error('secret provider error') }), /Promotion outcome unconfirmed/)
  assert.throws(() => read(remote))
}))
test('tag success followed by publication failure is explicit and publish-only retry never retags', async () => localRemote(async remote => {
  const e = await promotionEvidence()
  await assert.rejects(promoteAndPublish(e.selection, e.receipt, e.probes, `${remote}/missing`, e.tag), /Promotion succeeded; catalog publication failed/)
  assert.equal(e.tags(), 1)
  await publishCatalog(remote, () => validateRelease(e.selection, e.receipt, e.probes))
  assert.equal(e.tags(), 1); assert.equal(read(remote).deployments[0].deploymentId, 'selectedCID')
}))


test('malicious publication symlinks cannot write outside the temporary checkout', async () => {
  for (const target of ['directory', 'file']) await localRemote(async remote => {
    await publishCatalog(remote, async () => active)
    const temporary = mkdtempSync(join(tmpdir(), 'catalog-hostile-'))
    try {
      const checkout = join(temporary, 'checkout'), outside = join(temporary, 'outside')
      mkdirSync(outside)
      const sentinel = join(outside, 'catalog.json')
      writeFileSync(sentinel, 'external sentinel')
      git(temporary, 'clone', '--quiet', '--branch', 'catalog', remote, checkout)
      if (target === 'directory') {
        rmSync(join(checkout, 'v1'), { recursive: true })
        symlinkSync(outside, join(checkout, 'v1'))
      } else {
        rmSync(join(checkout, 'v1/catalog.json'))
        symlinkSync(sentinel, join(checkout, 'v1/catalog.json'))
      }
      git(checkout, 'add', '-A')
      git(checkout, '-c', 'user.name=Fixture', '-c', 'user.email=test@example.com', '-c', 'commit.gpgsign=false', 'commit', '-qm', 'Hostile publication fixture')
      git(checkout, 'push', '--quiet', 'origin', 'HEAD:refs/heads/catalog')
      const head = git(remote, 'rev-parse', 'refs/heads/catalog')
      await assert.rejects(publishCatalog(remote, async () => ({ ...active, version: '2.0.0' })))
      assert.equal(readFileSync(sentinel, 'utf8'), 'external sentinel')
      assert.equal(git(remote, 'rev-parse', 'refs/heads/catalog'), head)
    } finally { rmSync(temporary, { recursive: true, force: true }) }
  })
})
