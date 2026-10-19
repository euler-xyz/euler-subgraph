export function createProbeTransport({ fetchImpl = fetch, ipfsGateway = 'https://ipfs.io/ipfs/' } = {}) {
  const gateway = new URL(ipfsGateway)
  if (gateway.protocol !== 'https:' || gateway.username || gateway.password || gateway.search || gateway.hash) throw new Error('Invalid IPFS gateway')
  if (!gateway.pathname.endsWith('/')) gateway.pathname += '/'
  function ipfsUrl(reference) {
    const cidPath = typeof reference === 'string' ? reference.replace(/^\/ipfs\//, '') : ''
    if (!/^[A-Za-z0-9]+(?:\/[A-Za-z0-9._-]+)*$/.test(cidPath) || cidPath.split('/').some(part => part === '.' || part === '..')) throw new Error('Invalid artifact reference')
    return new URL(cidPath, gateway).href
  }
  async function request(url, body) {
    const response = await fetchImpl(url, { method: body ? 'POST' : 'GET', body: body ? JSON.stringify(body) : undefined,
      headers: body ? { 'content-type': 'application/json' } : undefined, redirect: 'error', signal: AbortSignal.timeout(20000) })
    if (!response.ok) throw new Error('Read-only probe failed')
    const bytes = new Uint8Array(await response.arrayBuffer())
    if (bytes.length > 16 * 1024 * 1024) throw new Error('Probe response too large')
    return bytes
  }
  return { ipfsUrl, request }
}
