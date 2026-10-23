import { CatalogValidationError } from './errors.mjs'
import { createHash } from 'node:crypto'

export const capabilities = ['account-vault-discovery', 'vault-factory-lookup']
export const versionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:\.(0|[1-9]\d*))?$/
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const nonempty = value => typeof value === 'string' && value.trim().length > 0
export const identity = row => `${row.chainId}:${row.family}:${row.channel}`
export function publicEndpoint(value) {
  try {
    const url = new URL(value)
    return typeof value === 'string' && url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash
  } catch { return false }
}
export function validRecord(row) {
  if (!object(row) || !Number.isSafeInteger(row.chainId) || row.chainId <= 0 || !nonempty(row.family) || !nonempty(row.channel)) return false
  if (row.status === 'retired') return true
  return row.status === 'active' && versionPattern.test(row.version) && publicEndpoint(row.endpoint)
    && nonempty(row.deploymentId) && /^[a-f0-9]{40}$/i.test(row.sourceCommit)
    && (row.interfacesCommit === undefined || /^[a-f0-9]{40}$/i.test(row.interfacesCommit))
    && Number.isSafeInteger(row.startBlock) && row.startBlock >= 0
    && Array.isArray(row.capabilities) && row.capabilities.every(nonempty)
}
export function parseCatalog(value) {
  if (!object(value) || value.schemaVersion !== 1 || !nonempty(value.revision)
    || typeof value.publishedAt !== 'string' || !/^\d{4}-\d\d-\d\dT.*(?:Z|[+-]\d\d:\d\d)$/.test(value.publishedAt)
    || !Number.isFinite(Date.parse(value.publishedAt)) || !Array.isArray(value.deployments)) throw new CatalogValidationError('Invalid catalog envelope')
  const records = new Map(), diagnostics = [], blocked = new Set()
  for (const row of value.deployments) {
    const key = object(row) && Number.isSafeInteger(row.chainId) && row.chainId > 0 && nonempty(row.family) && nonempty(row.channel) ? identity(row) : undefined
    if (!validRecord(row) || (key && (records.has(key) || blocked.has(key)))) {
      diagnostics.push({ code: key && (records.has(key) || blocked.has(key)) ? 'duplicate' : 'invalid', identity: key })
      if (key) { blocked.add(key); records.delete(key) }
    } else if (!blocked.has(key)) records.set(key, row)
  }
  return { catalog: value, records, diagnostics, blocked }
}
export function resolveCatalog(parsed, chainId, capability, channel = 'stable') {
  const key = `${chainId}:euler-simple:${channel}`
  if (parsed.blocked.has(key)) return { status: 'invalid' }
  const record = parsed.records.get(key)
  if (!record) return { status: 'missing' }
  if (record.status === 'retired') return { status: 'retired' }
  if (!record.capabilities.includes(capability)) return { status: 'unsupported-capability' }
  return { status: 'active', record }
}
export function updateCatalog(previous, record, now = new Date()) {
  const parsed = parseCatalog(previous)
  if (parsed.diagnostics.length || !validRecord(record)) throw new CatalogValidationError('Publication requires valid, unique records')
  const deployments = previous.deployments.filter(row => identity(row) !== identity(record)).concat(record).sort((a, b) => identity(a).localeCompare(identity(b)))
  const revision = createHash('sha256').update(JSON.stringify(deployments)).digest('hex')
  return { schemaVersion: 1, revision, publishedAt: now.toISOString(), deployments }
}
