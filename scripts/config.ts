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
    worldchainAddresses,
    lineaAddresses,
    plasmaAddresses,
    mantleAddresses
} from '../contracts/addresses'

export type Network = typeof NETWORKS[number]

export type Version = { major: number; minor: number; patch: number; hotfix?: number }

export const networks = {
    mainnet: {
        network: 'mainnet',
        ...mainnetAddresses.coreAddresses,
        ...mainnetAddresses.swapAddresses,
        ...mainnetAddresses.peripheryAddresses,
        startBlock: 20529207
    },
    arbitrum: {
        network: 'arbitrum-one',
        ...arbitrumAddresses.coreAddresses,
        ...arbitrumAddresses.swapAddresses,
        ...arbitrumAddresses.peripheryAddresses,
        startBlock: 238643655
    },
    base: {
        network: 'base',
        ...baseAddresses.coreAddresses,
        ...baseAddresses.swapAddresses,
        ...baseAddresses.peripheryAddresses,
        startBlock: 22282411
    },
    swell: {
        network: 'swell',
        ...swellAddresses.coreAddresses,
        ...swellAddresses.swapAddresses,
        ...swellAddresses.peripheryAddresses,
        startBlock: 485376
    },
    sonic: {
        network: 'sonic',
        ...sonicAddresses.coreAddresses,
        ...sonicAddresses.swapAddresses,
        ...sonicAddresses.peripheryAddresses,
        startBlock: 5324457
    },
    ink: {
        network: 'ink',
        ...inkAddresses.coreAddresses,
        ...inkAddresses.swapAddresses,
        ...inkAddresses.peripheryAddresses,
        startBlock: 3900333
    },
    unichain: {
        network: 'unichain',
        ...unichainAddresses.coreAddresses,
        ...unichainAddresses.swapAddresses,
        ...unichainAddresses.peripheryAddresses,
        startBlock: 8541547
    },
    avalanche: {
        network: 'avalanche',
        ...avalancheAddresses.coreAddresses,
        ...avalancheAddresses.swapAddresses,
        ...avalancheAddresses.peripheryAddresses,
        startBlock: 56805796
    },
    berachain: {
        network: 'berachain-mainnet',
        ...berachainAddresses.coreAddresses,
        ...berachainAddresses.swapAddresses,
        ...berachainAddresses.peripheryAddresses,
        startBlock: 1095611
    },
    bob: {
        network: 'bob',
        ...bobAddresses.coreAddresses,
        ...bobAddresses.swapAddresses,
        ...bobAddresses.peripheryAddresses,
        startBlock: 13157157
    },
    bsc: {
        network: 'bsc',
        ...bscAddresses.coreAddresses,
        ...bscAddresses.swapAddresses,
        ...bscAddresses.peripheryAddresses,
        startBlock: 46370000
    },
    worldchain: {
        network: 'worldchain',
        ...worldchainAddresses.coreAddresses,
        ...worldchainAddresses.swapAddresses,
        ...worldchainAddresses.peripheryAddresses,
        startBlock: 9800000
    },
    hyperevm: {
        network: 'hyperevm',
        ...hyperevmAddresses.coreAddresses,
        ...hyperevmAddresses.swapAddresses,
        ...hyperevmAddresses.peripheryAddresses,
        startBlock: 1 // TODO: Check if this is correct I didn't find the correct block number
    },
    optimism: {
        network: 'optimism',
        ...optimismAddresses.coreAddresses,
        ...optimismAddresses.swapAddresses,
        ...optimismAddresses.peripheryAddresses,
        startBlock: 131500000
    },
    gnosis: {
        network: 'xdai',
        ...gnosisAddresses.coreAddresses,
        ...gnosisAddresses.swapAddresses,
        ...gnosisAddresses.peripheryAddresses,
        startBlock: 38380000
    },
    tacturin: {
        network: 'tac-turin',
        ...tacTurinAddresses.coreAddresses,
        ...tacTurinAddresses.swapAddresses,
        ...tacTurinAddresses.peripheryAddresses,
        startBlock: 5066361
    },
    tac: {
        network: 'tac',
        ...tacAddresses.coreAddresses,
        ...tacAddresses.swapAddresses,
        ...tacAddresses.peripheryAddresses,
        startBlock: 860000
    },
    linea: {
        network: 'linea',
        ...lineaAddresses.coreAddresses,
        ...lineaAddresses.swapAddresses,
        ...lineaAddresses.peripheryAddresses,
        startBlock: 17900000
    },
    plasma: {
        network: 'plasma-mainnet',
        ...plasmaAddresses.coreAddresses,
        ...plasmaAddresses.swapAddresses,
        ...plasmaAddresses.peripheryAddresses,
        startBlock: 4241642
    },
    mantle: {
        network: 'mantle',
        ...mantleAddresses.coreAddresses,
        ...mantleAddresses.swapAddresses,
        ...mantleAddresses.peripheryAddresses,
        startBlock: 84500000
    }
}


export const NETWORKS = Object.keys(networks)
