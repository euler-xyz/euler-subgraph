import { execFileSync } from 'node:child_process'
import { readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { networks } from '../config'
import { validateRelease } from './validate.mjs'
import { writeBuildReceipt } from './receipt.mjs'
import { createProbeTransport } from './transport.mjs'
import { createCheckpointProbes } from './probes.mjs'
import { publishCatalog } from './publish.mjs'
import { promoteAndPublish } from './promote.mjs'

const root = resolve(import.meta.dir, '../..')
const run = (program: string, args: string[]) => execFileSync(program, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 60000, maxBuffer: 16 * 1024 * 1024 }).trim()
const parseYaml = (text: string) => Bun.YAML.parse(text) as any
const [command, network, version, channel = 'stable', checkpointText] = process.argv.slice(2)
const config = networks[network as keyof typeof networks]
const receiptPath = resolve(root, '.catalog', `${network}.json`)
try {
  if (!config || !config.chainId) throw new Error('Unsupported network')
  if (command === 'receipt') {
    const result = await writeBuildReceipt({ root, network, config, parseManifest: parseYaml })
    if (result.status === 'dirty') console.warn('Catalog receipt skipped: source tree has uncommitted files. Commit the source and rebuild before catalog publication.')
    else console.log('Catalog build receipt recorded locally.')
  } else if (command === 'retire') {
    if (!['stable', 'candidate'].includes(version) || !process.env.CATALOG_GIT_REMOTE) throw new Error('Provide retirement channel and CATALOG_GIT_REMOTE')
    const result = await publishCatalog(process.env.CATALOG_GIT_REMOTE, async () => ({ chainId: config.chainId, family: 'euler-simple', channel: version, status: 'retired' }))
    console.log(`Catalog ${result.status}; revision ${result.revision}`)
  } else if (command === 'publish' || command === 'promote') {
    const { request, ipfsUrl } = createProbeTransport({ ipfsGateway: process.env.CATALOG_IPFS_GATEWAY })
    const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'))
    if (receipt.network !== network || receipt.chainId !== config.chainId) throw new Error('Receipt network mismatch')
    const rpc = process.env[`RPC_URL_${receipt.chainId}`]
    const remote = process.env.CATALOG_GIT_REMOTE
    if (!rpc || !remote || !checkpointText || !/^\d+$/.test(checkpointText)) throw new Error('Set RPC_URL_<chainId>, CATALOG_GIT_REMOTE and provide checkpoint')
    const selection = { version, channel, checkpoint: Number(checkpointText) }
    const probes = {
      ...createCheckpointProbes({ request, rpc }),
      inventory: async () => run('goldsky', ['subgraph', 'list']),
      manifest: async (cid: string) => parseYaml(new TextDecoder().decode(await request(ipfsUrl(cid)))),
      artifact: async (file: string) => request(ipfsUrl(file))
    }
    const result = command === 'promote'
      ? await promoteAndPublish(selection, receipt, probes, remote, async (name: string, selectedVersion: string) => { run('goldsky', ['subgraph', 'tag', 'create', `${name}/${selectedVersion}`, '--tag', 'latest']) })
      : await publishCatalog(remote, () => validateRelease(selection, receipt, probes))
    console.log(`Catalog ${result.status}; revision ${result.revision}`)
  } else throw new Error('Usage: bun scripts/catalog/cli.ts receipt <network> | publish <network> <version> <stable|candidate> <checkpoint>')
} catch (error) {
  // Provider/Git errors can embed authenticated URLs. Never print raw errors.
  if (command === 'promote') {
    const message = error instanceof Error ? error.message : ''
    const safe = ['Promotion outcome unconfirmed. Inspect the selected alias and use publish-only retry if promotion succeeded.', 'Promotion succeeded; catalog publication failed or is unconfirmed. Retry catalog:publish without retagging.']
    console.error(safe.includes(message) ? message : 'Promotion preflight failed; no tag was changed by this command. Check receipt, release, indexing and access.')
  } else console.error('Catalog operation failed; no deployment or promotion was performed. Publication may be unconfirmed; retry against the selected release to reconcile. Check local receipt, exact release, indexing, RPC and Git access.')
  if (command === 'receipt') {
    try { rmSync(receiptPath, { force: true }) } catch { /* Keep manual builds available if local cleanup fails. */ }
    console.warn('Build remains usable for manual deployment; catalog publication requires a successful receipt from a clean rebuild.')
  } else process.exitCode = 1
}
