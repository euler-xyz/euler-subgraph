import {
    arbitrumAddresses,
    avalancheAddresses,
    baseAddresses,
    berachainAddresses,
    bobAddresses,
    bscAddresses,
    gnosisAddresses,
    hyperevmAddresses,
    inkAddresses,
    mainnetAddresses,
    optimismAddresses,
    sonicAddresses,
    swellAddresses,
    tacAddresses,
    tacTurinAddresses,
    unichainAddresses,
    worldchainAddresses
} from '../contracts/addresses'

export type Network = typeof NETWORKS[number]

export type Version = { major: number; minor: number; patch: number }

export const networks = {
    mainnet: {
        network: 'mainnet',
        ...mainnetAddresses.coreAddresses,
        ...mainnetAddresses.swapAddresses,
        startBlock: 20529207
    },
    arbitrum: {
        network: 'arbitrum-one',
        ...arbitrumAddresses.coreAddresses,
        ...arbitrumAddresses.swapAddresses,
        startBlock: 238643655
    },
    base: {
        network: 'base',
        ...baseAddresses.coreAddresses,
        ...baseAddresses.swapAddresses,
        startBlock: 22282411
    },
    swell: {
        network: 'swell',
        ...swellAddresses.coreAddresses,
        ...swellAddresses.swapAddresses,
        startBlock: 485376
    },
    sonic: {
        network: 'sonic',
        ...sonicAddresses.coreAddresses,
        ...sonicAddresses.swapAddresses,
        startBlock: 5324457
    },
    ink: {
        network: 'ink',
        ...inkAddresses.coreAddresses,
        ...inkAddresses.swapAddresses,
        startBlock: 3900333
    },
    unichain: {
        network: 'unichain',
        ...unichainAddresses.coreAddresses,
        ...unichainAddresses.swapAddresses,
        startBlock: 8541547
    },
    avalanche: {
        network: 'avalanche',
        ...avalancheAddresses.coreAddresses,
        ...avalancheAddresses.swapAddresses,
        startBlock: 56805796
    },
    berachain: {
        network: 'berachain-mainnet',
        ...berachainAddresses.coreAddresses,
        ...berachainAddresses.swapAddresses,
        startBlock: 1095611
    },
    bob: {
        network: 'bob',
        ...bobAddresses.coreAddresses,
        ...bobAddresses.swapAddresses,
        startBlock: 13157157
    },
    bsc: {
        network: 'bsc',
        ...bscAddresses.coreAddresses,
        ...bscAddresses.swapAddresses,
        startBlock: 46370000
    },
    worldchain: {
        network: 'worldchain',
        ...worldchainAddresses.coreAddresses,
        ...worldchainAddresses.swapAddresses,
        startBlock: 9800000
    },
    hyperevm: {
        network: 'hyperevm',
        ...hyperevmAddresses.coreAddresses,
        ...hyperevmAddresses.swapAddresses,
        startBlock: 1 // TODO: Check if this is correct I didn't find the correct block number
    },
    optimism: {
        network: 'optimism',
        ...optimismAddresses.coreAddresses,
        ...optimismAddresses.swapAddresses,
        startBlock: 131500000
    },
    gnosis: {
        network: 'xdai',
        ...gnosisAddresses.coreAddresses,
        ...gnosisAddresses.swapAddresses,
        startBlock: 38380000
    },
    tacturin: {
        network: 'tac-turin',
        ...tacTurinAddresses.coreAddresses,
        ...tacTurinAddresses.swapAddresses,
        startBlock: 5066361
    },
    tac: {
        network: 'tac',
        ...tacAddresses.coreAddresses,
        ...tacAddresses.swapAddresses,
        startBlock: 860000
    }
}


export const NETWORKS = Object.keys(networks)
