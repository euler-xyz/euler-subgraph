import fs from 'fs'
import path from 'path'
import Mustache from 'mustache'
import {
  mainnetAddresses,
  arbitrumAddresses,
  baseAddresses,
  swellAddresses,
  sonicAddresses,
  inkAddresses,
  unichainAddresses,
  avalancheAddresses,
  berachainAddresses,
  bobAddresses
} from '../contracts/addresses'

const networks = {
  mainnet: {
    network: 'mainnet',
    ...mainnetAddresses.coreAddresses,
    startBlock: 20529207
  },
  arbitrum: {
    network: 'arbitrum-one',
    ...arbitrumAddresses.coreAddresses,
    startBlock: 238643655
  },
  base: {
    network: 'base',
    ...baseAddresses.coreAddresses,
    startBlock: 22282411
  },
  swell: {
    network: 'swell',
    ...swellAddresses.coreAddresses,
    startBlock: 485376
  },
  sonic: {
    network: 'sonic',
    ...sonicAddresses.coreAddresses,
    startBlock: 5324457
  },
  ink: {
    network: 'ink',
    ...inkAddresses.coreAddresses,
    startBlock: 3900333
  },
  unichain: {
    network: 'unichain',
    ...unichainAddresses.coreAddresses,
    startBlock: 8541547
  },
  avalanche: {
    network: 'avalanche',
    ...avalancheAddresses.coreAddresses,
    startBlock: 56805796
  },
  berachain: {
    network: 'berachain-mainnet',
    ...berachainAddresses.coreAddresses,
    startBlock: 1095611
  },
  bob: {
    network: 'bob',
    ...bobAddresses.coreAddresses,
    startBlock: 13157157
  }
}

// Read template
const template = fs.readFileSync(
  path.join(__dirname, '../template/subgraph.template.yaml'),
  'utf8'
)

function generateConfig(network: keyof typeof networks) {
  const config = networks[network]
  // Force string rendering for specific fields
  // @ts-ignore
  const output = Mustache.render(template, config, {}, {
    escape: (value: any) => {
      if (typeof value === 'string' && value.startsWith('0x')) {
        return value;
      }
      return value;
    }
  })
  fs.writeFileSync(path.join(__dirname, '../subgraph.yaml'), output)
}

// Get network from command line args
const network = process.argv[2] as keyof typeof networks || 'mainnet'
if (!networks[network]) {
  throw new Error(`Network ${network} not supported`)
}
console.log("Generating config for: ", networks[network])
generateConfig(network) 