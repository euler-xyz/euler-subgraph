import fs from 'fs'
import path from 'path'

// Chain IDs mapped to network names used in subgraph deployments
const NETWORKS: Record<string, { chainId: number; graphNetwork: string; startBlock: number }> = {
  mainnet:    { chainId: 1,      graphNetwork: 'mainnet',           startBlock: 20529207 },
  base:       { chainId: 8453,   graphNetwork: 'base',              startBlock: 22282411 },
  arbitrum:   { chainId: 42161,  graphNetwork: 'arbitrum-one',      startBlock: 238643655 },
  swell:      { chainId: 1923,   graphNetwork: 'swell',             startBlock: 485376 },
  sonic:      { chainId: 146,    graphNetwork: 'sonic',             startBlock: 5324457 },
  berachain:  { chainId: 80094,  graphNetwork: 'berachain-mainnet', startBlock: 1095611 },
  bob:        { chainId: 60808,  graphNetwork: 'bob',               startBlock: 13157157 },
  unichain:   { chainId: 130,    graphNetwork: 'unichain',          startBlock: 8541547 },
  avalanche:  { chainId: 43114,  graphNetwork: 'avalanche',         startBlock: 56805796 },
  bsc:        { chainId: 56,     graphNetwork: 'bsc',               startBlock: 46370000 },
  hyperevm:   { chainId: 999,    graphNetwork: 'hyperevm',          startBlock: 1980586 },
  tac:        { chainId: 239,    graphNetwork: 'tac',               startBlock: 860000 },
  linea:      { chainId: 59144,  graphNetwork: 'linea',             startBlock: 17900000 },
  plasma:     { chainId: 9745,   graphNetwork: 'plasma-mainnet',    startBlock: 510000 },
  monad:      { chainId: 143,    graphNetwork: 'monad',             startBlock: 30858000 },
}

export type Network = keyof typeof NETWORKS

export type Version = { major: number; minor: number; patch: number; hotfix?: number }

type Addresses = Record<string, string | undefined>

function loadAddresses(chainId: number, file: string): Addresses | null {
  const addressPath = path.join(
    __dirname,
    `../lib/euler-interfaces/addresses/${chainId}/${file}.json`
  )
  try {
    return JSON.parse(fs.readFileSync(addressPath, 'utf8'))
  } catch {
    return null
  }
}

export function getNetworkConfig(network: Network) {
  const config = NETWORKS[network]
  if (!config) {
    throw new Error(`Network "${network}" not supported. Available: ${Object.keys(NETWORKS).join(', ')}`)
  }

  const core = loadAddresses(config.chainId, 'CoreAddresses')
  const periphery = loadAddresses(config.chainId, 'PeripheryAddresses')

  return {
    network: config.graphNetwork,
    startBlock: config.startBlock,
    eVaultFactory: core?.eVaultFactory,
    eulerEarnFactory: core?.eulerEarnFactory,
    securitizeFactory: periphery?.securitizeFactory || null,
  }
}

// Export network names as array for validation
export const NETWORK_NAMES = Object.keys(NETWORKS) as Network[]

// For backwards compatibility - expose networks object
export const networks = Object.fromEntries(
  Object.keys(NETWORKS).map(name => [name, getNetworkConfig(name as Network)])
) as Record<Network, ReturnType<typeof getNetworkConfig>>
