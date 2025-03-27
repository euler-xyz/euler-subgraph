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
    bobAddresses,
    bscAddresses
} from '../contracts/addresses'

export type Network = typeof NETWORKS[number]

export type Version = { major: number; minor: number; patch: number }

export const networks = {
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
    },
    bsc: {
        network: 'bsc',
        ...bscAddresses.coreAddresses,
        startBlock: 46370000
    }
}


export const NETWORKS = Object.keys(networks)
