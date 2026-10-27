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

const responseLimit = 16 * 1024 * 1024

test('read-only transport cancels chunked responses immediately above 16 MiB', async (t) => {
  for (const headers of [{}, { 'content-length': '1' }]) {
    await t.test(Object.keys(headers).length ? 'misleading content length' : 'no content length', async () => {
      let pulls = 0, cancelled = false
      const stream = new ReadableStream({
        pull(controller) {
          if (pulls === 32) { controller.close(); return }
          pulls++
          controller.enqueue(new Uint8Array(1024 * 1024))
        },
        cancel() { cancelled = true }
      }, { highWaterMark: 0 })
      const transport = createProbeTransport({ fetchImpl: async () => new Response(stream, { headers }) })
      await assert.rejects(transport.request('https://probe.example'), { name: 'CatalogValidationError', message: 'Probe response too large' })
      assert.equal(pulls, 17)
      assert.equal(cancelled, true)
      assert.equal(stream.locked, false)
    })
  }
})

test('read-only transport preserves binary chunks at the exact 16 MiB boundary', async () => {
  const prefix = new Uint8Array(responseLimit - 3).fill(0xa5)
  const backing = Uint8Array.of(0x00, 0xff, 0xc3, 0xa9, 0x00)
  const chunks = [prefix, backing.subarray(1, 4)]
  let cancelled = false
  const stream = new ReadableStream({
    pull(controller) {
      if (chunks.length) controller.enqueue(chunks.shift())
      else controller.close()
    },
    cancel() { cancelled = true }
  }, { highWaterMark: 0 })
  const transport = createProbeTransport({ fetchImpl: async () => new Response(stream) })
  const bytes = await transport.request('https://probe.example', { query: 'query { _meta { deployment } }' })
  assert.equal(bytes.byteLength, responseLimit)
  assert.deepEqual(bytes.subarray(0, prefix.byteLength), prefix)
  assert.deepEqual(bytes.subarray(prefix.byteLength), Uint8Array.of(0xff, 0xc3, 0xa9))
  assert.equal(cancelled, false)
  assert.equal(stream.locked, false)
})

test('read-only transport preserves empty and bodyless successful responses', async () => {
  for (const response of [new Response(''), new Response(null, { status: 204 })]) {
    const transport = createProbeTransport({ fetchImpl: async () => response })
    assert.deepEqual(await transport.request('https://probe.example'), new Uint8Array())
  }
})

test('read-only transport propagates read failures without returning partial bytes', async () => {
  const error = new Error('controlled stream failure')
  let pulls = 0
  const stream = new ReadableStream({
    pull(controller) {
      if (pulls++ === 0) controller.enqueue(Uint8Array.of(0x01))
      else controller.error(error)
    }
  }, { highWaterMark: 0 })
  const transport = createProbeTransport({ fetchImpl: async () => new Response(stream) })
  await assert.rejects(transport.request('https://probe.example'), error)
  assert.equal(stream.locked, false)
})

test('read-only transport preserves its safe size error if cancellation rejects', async () => {
  let cancelled = false, sent = false
  const stream = new ReadableStream({
    pull(controller) {
      if (sent) { controller.close(); return }
      sent = true
      controller.enqueue(new Uint8Array(responseLimit + 1))
    },
    cancel() { cancelled = true; throw new Error('untrusted cancellation details') }
  }, { highWaterMark: 0 })
  const transport = createProbeTransport({ fetchImpl: async () => new Response(stream) })
  await assert.rejects(transport.request('https://probe.example'), { name: 'CatalogValidationError', message: 'Probe response too large' })
  assert.equal(cancelled, true)
  assert.equal(stream.locked, false)
})
