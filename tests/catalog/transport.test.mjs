import test from 'node:test'
import assert from 'node:assert/strict'
import { createProbeTransport } from '../../scripts/catalog/transport.mjs'
test('operator gateway preserves its fixed origin and prefix', () => {
  const { ipfsUrl } = createProbeTransport({ ipfsGateway: 'https://gateway.example/custom/ipfs' })
  assert.equal(ipfsUrl('/ipfs/QmCID/mapping.wasm'), 'https://gateway.example/custom/ipfs/QmCID/mapping.wasm')
  for (const path of ['../secret', 'QmCID/../secret', 'QmCID/./secret', 'QmCID/%2e%2e/secret', 'https://other.example/QmCID', '//other.example/QmCID', 'QmCID?token=secret', 'QmCID#fragment', 'QmCID\\..\\secret']) assert.throws(() => ipfsUrl(path))
  for (const gateway of ['http://example.com/ipfs/', 'https://user:secret@example.com/ipfs/', 'https://example.com/?key=secret', 'https://example.com/#fragment']) assert.throws(() => createProbeTransport({ ipfsGateway: gateway }))
})
test('read-only transport forbids redirects and fails on redirect/error responses', async () => {
  const calls = []
  const transport = createProbeTransport({ fetchImpl: async (url, init) => { calls.push({ url, init }); return new Response('', { status: 302, headers: { location: 'https://other.example' } }) } })
  await assert.rejects(transport.request(transport.ipfsUrl('QmCID')))
  assert.equal(calls.length, 1); assert.equal(calls[0].init.redirect, 'error')
  assert.ok(calls[0].init.signal instanceof AbortSignal)
  const working = createProbeTransport({ fetchImpl: async () => new Response('controlled artifact') })
  assert.equal(new TextDecoder().decode(await working.request(working.ipfsUrl('QmCID'))), 'controlled artifact')
})
