import { readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { validateRelease } from './validate.mjs'
import { writeBuildReceipt } from './receipt.mjs'
import { createProbeTransport } from './transport.mjs'
import { createCheckpointProbes } from './probes.mjs'
import { publishCatalog } from './publish.mjs'
import { promoteAndPublish } from './promote.mjs'
import { CatalogValidationError, catalogFailureMessage } from './errors.mjs'

// The CLI and offline regressions share this dispatcher. Its runner receives argument arrays.
export async function runCatalogCommand({ argv, networks, root, parseManifest, run, env = process.env, output = console }) {
  const [command, network, version, channel = 'stable', checkpointText] = argv
  let receiptPath
  try {
    if (!['receipt', 'retire', 'publish', 'promote'].includes(command)) throw new CatalogValidationError('Usage: catalog:publish or catalog:promote <network> <version> <stable|candidate> <checkpoint>; catalog:retire <network> <stable|candidate>; bun scripts/catalog/cli.ts receipt <network>')
    const config = /^[a-z0-9]+$/.test(network) && Object.hasOwn(networks, network) ? networks[network] : undefined
    if (!config || !Number.isSafeInteger(config.chainId) || config.chainId <= 0) throw new CatalogValidationError('Unsupported network or missing chainId in scripts/config.ts')
    receiptPath = resolve(root, '.catalog', `${network}.json`)
    if (command === 'receipt') {
      const result = await writeBuildReceipt({ root, network, config, parseManifest })
      if (result.status === 'dirty') output.warn('Catalog receipt skipped: source tree has uncommitted files. Build remains usable for manual deployment; commit the source and rebuild before catalog publication.')
      else output.log('Catalog build receipt recorded locally.')
    } else if (command === 'retire') {
      if (!['stable', 'candidate'].includes(version) || !env.CATALOG_GIT_REMOTE) throw new CatalogValidationError('Provide retirement channel and CATALOG_GIT_REMOTE')
      const result = await publishCatalog(env.CATALOG_GIT_REMOTE, async () => ({ chainId: config.chainId, family: 'euler-simple', channel: version, status: 'retired' }))
      output.log(`Catalog ${result.status}; revision ${result.revision}`)
    } else {
      let receipt
      try { receipt = JSON.parse(readFileSync(receiptPath, 'utf8')) }
      catch { throw new CatalogValidationError('Missing or unreadable build receipt; run a clean build for the selected network') }
      if (!receipt || receipt.network !== network || receipt.chainId !== config.chainId) throw new CatalogValidationError('Receipt network mismatch')
      const rpc = env[`RPC_URL_${receipt.chainId}`]
      const remote = env.CATALOG_GIT_REMOTE
      if (!rpc || !remote || !checkpointText || !/^\d+$/.test(checkpointText)) throw new CatalogValidationError('Set RPC_URL_<chainId>, CATALOG_GIT_REMOTE and provide checkpoint')
      const { request, ipfsUrl } = createProbeTransport({ ipfsGateway: env.CATALOG_IPFS_GATEWAY })
      const selection = { version, channel, checkpoint: Number(checkpointText) }
      const probes = {
        ...createCheckpointProbes({ request, rpc }),
        inventory: async () => run('goldsky', ['subgraph', 'list']),
        manifest: async cid => parseManifest(new TextDecoder().decode(await request(ipfsUrl(cid)))),
        artifact: async file => request(ipfsUrl(file))
      }
      const result = command === 'promote'
        ? await promoteAndPublish(selection, receipt, probes, remote, async (name, selectedVersion) => { run('goldsky', ['subgraph', 'tag', 'create', `${name}/${selectedVersion}`, '--tag', 'latest']) })
        : await publishCatalog(remote, () => validateRelease(selection, receipt, probes))
      output.log(`Catalog ${result.status}; revision ${result.revision}`)
    }
    return 0
  } catch (error) {
    output.error(catalogFailureMessage(command, error))
    if (command !== 'receipt') return 1
    if (receiptPath) {
      try { rmSync(receiptPath, { force: true }) } catch { /* Keep manual builds available if local cleanup fails. */ }
    }
    output.warn('Build remains usable for manual deployment; catalog publication requires a successful receipt from a clean rebuild.')
    return 0
  }
}
