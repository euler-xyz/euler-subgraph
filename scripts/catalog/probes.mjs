const blockHashPattern = /^0x[a-f0-9]{64}$/i
const decode = bytes => JSON.parse(new TextDecoder().decode(bytes))
function rpcQuantity(value) {
  if (typeof value !== 'string' || !/^0x(?:0|[1-9a-f][a-f0-9]*)$/i.test(value)) throw new Error('Invalid RPC quantity')
  const number = Number(BigInt(value))
  if (!Number.isSafeInteger(number)) throw new Error('Unsafe RPC quantity')
  return number
}

export function createCheckpointProbes({ request, rpc }) {
  async function rpcCall(method, params) {
    const body = decode(await request(rpc, { jsonrpc: '2.0', id: 1, method, params }))
    if (body.error || body.result === undefined) throw new Error('RPC verification failed')
    return body.result
  }
  return {
    async chainCheckpoint(number) {
      if (!Number.isSafeInteger(number) || number < 0) throw new Error('Invalid checkpoint number')
      const chainId = rpcQuantity(await rpcCall('eth_chainId', []))
      const block = await rpcCall('eth_getBlockByNumber', [`0x${number.toString(16)}`, false])
      if (!chainId || !block || rpcQuantity(block.number) !== number || !blockHashPattern.test(block.hash)) throw new Error('Invalid RPC checkpoint')
      return { chainId, number, hash: block.hash.toLowerCase() }
    },
    async graphql(endpoint, checkpoint) {
      if (!blockHashPattern.test(checkpoint?.hash)) throw new Error('Invalid checkpoint hash')
      const block = `{hash: "${checkpoint.hash}"}`
      const body = decode(await request(endpoint, { query: `query { _meta(block: ${block}) { deployment hasIndexingErrors block { number hash } } trackingActiveAccounts(first: 1, block: ${block}) { id addressPrefix deposits borrows } vaults(first: 1, block: ${block}) { id factory } }` }))
      if (body.errors?.length || !Array.isArray(body.data?.trackingActiveAccounts) || !Array.isArray(body.data?.vaults)) throw new Error('Required query capabilities unavailable')
      return body.data._meta
    }
  }
}
