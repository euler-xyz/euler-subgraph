import { CatalogValidationError } from './errors.mjs'
export function createProbeTransport({ fetchImpl = fetch, ipfsGateway = 'https://ipfs.io/ipfs/' } = {}) {
  let gateway
  try { gateway = new URL(ipfsGateway) } catch { throw new CatalogValidationError('Invalid IPFS gateway') }
  if (gateway.protocol !== 'https:' || gateway.username || gateway.password || gateway.search || gateway.hash) throw new CatalogValidationError('Invalid IPFS gateway')
  if (!gateway.pathname.endsWith('/')) gateway.pathname += '/'
  function ipfsUrl(reference) {
    const cidPath = typeof reference === 'string' ? reference.replace(/^\/ipfs\//, '') : ''
    if (!/^[A-Za-z0-9]+(?:\/[A-Za-z0-9._-]+)*$/.test(cidPath) || cidPath.split('/').some(part => part === '.' || part === '..')) throw new CatalogValidationError('Invalid artifact reference')
    return new URL(cidPath, gateway).href
  }
  async function request(url, body) {
    const response = await fetchImpl(url, { method: body ? 'POST' : 'GET', body: body ? JSON.stringify(body) : undefined,
      headers: body ? { 'content-type': 'application/json' } : undefined, redirect: 'error', signal: AbortSignal.timeout(20000) })
    if (!response.ok) throw new CatalogValidationError('Read-only probe failed')
    if (!response.body) return new Uint8Array()
    const reader = response.body.getReader(), chunks = []
    let size = 0
    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        size += value.byteLength
        if (size > 16 * 1024 * 1024) {
          void reader.cancel().catch(() => {})
          throw new CatalogValidationError('Probe response too large')
        }
        chunks.push(value)
      }
    } finally { reader.releaseLock() }
    const bytes = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
    return bytes
  }
  return { ipfsUrl, request }
}
