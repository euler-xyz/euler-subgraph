import { CatalogValidationError } from './errors.mjs'
import { createHash } from 'node:crypto'
import { capabilities, publicEndpoint, versionPattern, validRecord } from './catalog.mjs'
export const digest = bytes => createHash('sha256').update(bytes).digest('hex')
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value

// Resolve every artifact reference before comparing build and deployed manifests.
export async function fingerprintManifest(manifest, readArtifact) {
  async function visit(value, key) {
    if (key === 'file') return { sha256: digest(await readArtifact(typeof value === 'string' ? value : value?.['/'])) }
    if (Array.isArray(value)) return Promise.all(value.map(item => visit(item)))
    if (value && typeof value === 'object') return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([k, v]) => [k, await visit(v, k)])))
    return value
  }
  return digest(JSON.stringify(canonical(await visit(manifest))))
}
export function selectEndpoint(inventory, name, version) {
  if (!/^euler-simple-[a-z0-9]+$/.test(name) || !versionPattern.test(version)) throw new CatalogValidationError('Invalid exact release selection')
  const matches = new Set()
  for (const token of inventory.match(/https:\/\/[^\s│|]+/g) ?? []) {
    if (!publicEndpoint(token)) continue
    const parts = new URL(token).pathname.split('/')
    if (parts.at(-1) === 'gn' && parts.at(-2) === version && parts.at(-3) === name && parts.at(-4) === 'subgraphs' && new URL(token).hostname === 'api.goldsky.com') matches.add(token)
  }
  if (matches.size !== 1) throw new CatalogValidationError('Exact release endpoint missing or ambiguous')
  return [...matches][0]
}
export function manifestScope(manifest) {
  if (!Array.isArray(manifest.dataSources) || !manifest.dataSources.length) throw new CatalogValidationError('Manifest has no data sources')
  return manifest.dataSources.map(row => ({ network: row.network, address: row.source?.address?.toLowerCase(), startBlock: row.source?.startBlock })).sort((a, b) => String(a.address).localeCompare(String(b.address)))
}
export async function validateRelease(selection, receipt, probes) {
  if (!['stable', 'candidate'].includes(selection.channel) || !versionPattern.test(selection.version) || !Number.isSafeInteger(selection.checkpoint) || selection.checkpoint < 0 || selection.checkpoint < receipt.startBlock) throw new CatalogValidationError('Invalid selection/checkpoint')
  if (receipt.schemaVersion !== 1 || !/^[a-f0-9]{64}$/.test(receipt.manifestFingerprint) || receipt.name !== `euler-simple-${receipt.network}`) throw new CatalogValidationError('Invalid build receipt')
  const checkpoint = await probes.chainCheckpoint(selection.checkpoint)
  if (!checkpoint || checkpoint.chainId !== receipt.chainId || checkpoint.number !== selection.checkpoint || !/^0x[a-f0-9]{64}$/i.test(checkpoint.hash)) throw new CatalogValidationError('Checkpoint does not match expected chain')
  const matchesCheckpoint = observation => observation?.hasIndexingErrors === false
    && observation.block?.number === checkpoint.number && typeof observation.block.hash === 'string'
    && observation.block.hash.toLowerCase() === checkpoint.hash.toLowerCase()
  const endpoint = selectEndpoint(await probes.inventory(), receipt.name, selection.version)
  const observation = await probes.graphql(endpoint, checkpoint)
  if (!observation || typeof observation.deployment !== 'string' || !observation.deployment || !matchesCheckpoint(observation)) throw new CatalogValidationError('Deployment is not indexed at checkpoint')
  const deployed = await probes.manifest(observation.deployment)
  if (await fingerprintManifest(deployed, probes.artifact) !== receipt.manifestFingerprint) throw new CatalogValidationError('Deployed artifacts differ from source build receipt')
  if (JSON.stringify(manifestScope(deployed)) !== JSON.stringify(receipt.scope)) throw new CatalogValidationError('Deployed contract/network scope differs')
  if (selection.channel === 'stable') {
    const alias = new URL(endpoint); const parts = alias.pathname.split('/'); parts[parts.length - 2] = 'latest'; alias.pathname = parts.join('/')
    const promoted = await probes.graphql(alias.href, checkpoint)
    if (!matchesCheckpoint(promoted) || promoted.deployment !== observation.deployment) throw new CatalogValidationError('Selected deployment is not the promoted latest alias')
  }
  const record = { chainId: receipt.chainId, family: 'euler-simple', channel: selection.channel, status: 'active', version: selection.version,
    endpoint, deploymentId: observation.deployment, capabilities, sourceCommit: receipt.sourceCommit, startBlock: receipt.startBlock,
    ...(receipt.interfacesCommit ? { interfacesCommit: receipt.interfacesCommit } : {}) }
  if (!validRecord(record)) throw new CatalogValidationError('Invalid release metadata')
  return record
}
