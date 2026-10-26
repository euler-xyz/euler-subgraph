import { capabilities, publicEndpoint, validRecord, versionPattern } from './catalog.mjs'
import { CatalogValidationError } from './errors.mjs'

// Only this fixed-origin GET carries the project credential. GraphQL/RPC never receive it.
export function createGoldskyReader({ apiKey, fetchImpl = fetch } = {}) {
  if (typeof apiKey !== 'string' || !apiKey.trim()) throw new CatalogValidationError('Set GOLDSKY_API_KEY for the intended Goldsky project')
  return async (network, version, graphNetwork = network) => {
    if (!/^[a-z0-9]+$/.test(network) || !/^[a-z0-9-]+$/.test(graphNetwork) || !(version === 'latest' || versionPattern.test(version))) throw new CatalogValidationError('Invalid Goldsky release selection')
    const name = `euler-simple-${network}`
    const response = await fetchImpl(`https://api.goldsky.com/api/v1/subgraphs/${name}/${version}`, {
      method: 'GET', headers: { authorization: `Bearer ${apiKey.trim()}` }, redirect: 'error', signal: AbortSignal.timeout(20_000),
    })
    if (!response.ok || !response.body) throw new CatalogValidationError('Goldsky inventory request failed')
    const reader = response.body.getReader(), chunks = []
    let size = 0
    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        size += value.byteLength
        if (size > 1_000_000) {
          void reader.cancel().catch(() => {})
          throw new CatalogValidationError('Goldsky inventory response too large')
        }
        chunks.push(value)
      }
    } finally { reader.releaseLock() }
    const bytes = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
    const body = JSON.parse(new TextDecoder().decode(bytes))
    // Exact-version responses can include tag rows too. Never pick the first row.
    // This endpoint documents no pagination parameters; incomplete responses fail closed.
    if (!Array.isArray(body?.data) || body.pagination?.next_page_token !== null) throw new CatalogValidationError('Goldsky inventory response is invalid or incomplete')
    const rows = body.data.filter(row => row?.name === name && row.version === version)
    if (rows.length !== 1) throw new CatalogValidationError('Goldsky release missing or ambiguous')
    const row = rows[0]
    if (row.network !== graphNetwork || row.status !== 'ACTIVE' || row.public_endpoint_enabled !== true || !publicEndpoint(row.graphql_endpoint)) throw new CatalogValidationError('Goldsky release network or public endpoint is unavailable')
    const url = new URL(row.graphql_endpoint)
    if (url.origin !== 'https://api.goldsky.com' || !new RegExp(`^/api/public/project_[a-zA-Z0-9]+/subgraphs/${name}/${version.replaceAll('.', '\\.')}/gn$`).test(url.pathname)) throw new CatalogValidationError('Goldsky endpoint does not match selected release')
    const ids = Array.isArray(row.deployments) ? row.deployments.map(item => item?.deployment_id) : []
    if (!ids.length || ids.some(id => typeof id !== 'string' || !id.trim()) || new Set(ids).size !== 1) throw new CatalogValidationError('Goldsky deployment identity missing or ambiguous')
    if (version === 'latest' ? !versionPattern.test(row.tag?.target_version) : row.tag !== undefined) throw new CatalogValidationError('Goldsky release/tag identity is invalid')
    return { endpoint: url.href, deploymentId: ids[0], ...(version === 'latest' ? { targetVersion: row.tag.target_version } : {}) }
  }
}

// Import proves provider/deployment identity and query compatibility, never source/build equality.
export async function validateImportedRelease(selection, config, probes) {
  if (!/^[a-z0-9]+$/.test(config.network) || !Number.isSafeInteger(config.chainId) || config.chainId <= 0
    || !['stable', 'candidate'].includes(selection.channel) || !versionPattern.test(selection.version)
    || !Number.isSafeInteger(selection.checkpoint) || selection.checkpoint < 0) throw new CatalogValidationError('Invalid import selection/checkpoint')
  const checkpoint = await probes.chainCheckpoint(selection.checkpoint)
  if (!checkpoint || checkpoint.chainId !== config.chainId || checkpoint.number !== selection.checkpoint || !/^0x[a-f0-9]{64}$/i.test(checkpoint.hash)) throw new CatalogValidationError('Checkpoint does not match expected chain')
  const matches = (observation, deploymentId) => observation?.deployment === deploymentId && observation.hasIndexingErrors === false
    && observation.block?.number === checkpoint.number && typeof observation.block.hash === 'string' && observation.block.hash.toLowerCase() === checkpoint.hash.toLowerCase()
  const release = await probes.release(config.network, selection.version, config.graphNetwork ?? config.network)
  if (!matches(await probes.graphql(release.endpoint, checkpoint), release.deploymentId)) throw new CatalogValidationError('Imported deployment identity or checkpoint differs')
  if (selection.channel === 'stable') {
    const alias = await probes.release(config.network, 'latest', config.graphNetwork ?? config.network)
    const expectedAlias = release.endpoint.replace(`/${selection.version}/gn`, '/latest/gn')
    if (alias.targetVersion !== selection.version || alias.endpoint !== expectedAlias || alias.deploymentId !== release.deploymentId
      || !matches(await probes.graphql(alias.endpoint, checkpoint), release.deploymentId)) throw new CatalogValidationError('Imported deployment is not the promoted latest alias')
  }
  const record = { chainId: config.chainId, family: 'euler-simple', channel: selection.channel, status: 'active', version: selection.version,
    endpoint: release.endpoint, deploymentId: release.deploymentId, capabilities }
  if (!validRecord(record)) throw new CatalogValidationError('Invalid imported release metadata')
  return record
}
