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
    polygonAddresses,
    sonicAddresses,
    swellAddresses,
    tacAddresses,
    tacTurinAddresses,
    unichainAddresses,
    worldchainAddresses,
    lineaAddresses,
    plasmaAddresses,
    mantleAddresses,
    monadAddresses,
    morphAddresses,
    sepoliaAddresses
} from '../contracts/addresses'

export const PROTOCOL_VERSION = "simple"

export type Network = typeof NETWORKS[number]

export type Version = { major: number; minor: number; patch: number; hotfix?: number }

export const networks = {
    mainnet: {
        chainId: 1,
        network: 'mainnet',
        ...mainnetAddresses.coreAddresses,
        ...mainnetAddresses.swapAddresses,
        ...mainnetAddresses.peripheryAddresses,

        startBlock: 20529207
    },
    arbitrum: {
        chainId: 42161,
        network: 'arbitrum-one',
        ...arbitrumAddresses.coreAddresses,
        ...arbitrumAddresses.swapAddresses,
        ...arbitrumAddresses.peripheryAddresses,
        startBlock: 238643655
    },
    base: {
        chainId: 8453,
        network: 'base',
        ...baseAddresses.coreAddresses,
        ...baseAddresses.swapAddresses,
        ...baseAddresses.peripheryAddresses,
        startBlock: 22282411
    },
    swell: {
        chainId: 1923,
        network: 'swell',
        ...swellAddresses.coreAddresses,
        ...swellAddresses.swapAddresses,
        ...swellAddresses.peripheryAddresses,
        startBlock: 485376
    },
    sonic: {
        chainId: 146,
        network: 'sonic',
        ...sonicAddresses.coreAddresses,
        ...sonicAddresses.swapAddresses,
        ...sonicAddresses.peripheryAddresses,
        startBlock: 5324457
    },
    ink: {
        chainId: 57073,
        network: 'ink',
        ...inkAddresses.coreAddresses,
        ...inkAddresses.swapAddresses,
        ...inkAddresses.peripheryAddresses,
        startBlock: 3900333
    },
    unichain: {
        chainId: 130,
        network: 'unichain',
        ...unichainAddresses.coreAddresses,
        ...unichainAddresses.swapAddresses,
        ...unichainAddresses.peripheryAddresses,
        startBlock: 8541547
    },
    avalanche: {
        chainId: 43114,
        network: 'avalanche',
        ...avalancheAddresses.coreAddresses,
        ...avalancheAddresses.swapAddresses,
        ...avalancheAddresses.peripheryAddresses,
        startBlock: 56805796
    },
    berachain: {
        chainId: 80094,
        network: 'berachain-mainnet',
        ...berachainAddresses.coreAddresses,
        ...berachainAddresses.swapAddresses,
        ...berachainAddresses.peripheryAddresses,
        startBlock: 1095611
    },
    bob: {
        chainId: 60808,
        network: 'bob',
        ...bobAddresses.coreAddresses,
        ...bobAddresses.swapAddresses,
        ...bobAddresses.peripheryAddresses,
        startBlock: 13157157
    },
    bsc: {
        chainId: 56,
        network: 'bsc',
        ...bscAddresses.coreAddresses,
        ...bscAddresses.swapAddresses,
        ...bscAddresses.peripheryAddresses,
        startBlock: 46370000
    },
    worldchain: {
        chainId: 480,
        network: 'worldchain',
        ...worldchainAddresses.coreAddresses,
        ...worldchainAddresses.swapAddresses,
        ...worldchainAddresses.peripheryAddresses,
        startBlock: 9800000
    },
    hyperevm: {
        chainId: 999,
        network: 'hyperevm',
        ...hyperevmAddresses.coreAddresses,
        ...hyperevmAddresses.swapAddresses,
        ...hyperevmAddresses.peripheryAddresses,
        startBlock: 1980586
    },
    optimism: {
        chainId: 10,
        network: 'optimism',
        ...optimismAddresses.coreAddresses,
        ...optimismAddresses.swapAddresses,
        ...optimismAddresses.peripheryAddresses,
        startBlock: 131500000
    },
    gnosis: {
        chainId: 100,
        network: 'xdai',
        ...gnosisAddresses.coreAddresses,
        ...gnosisAddresses.swapAddresses,
        ...gnosisAddresses.peripheryAddresses,
        startBlock: 38380000
    },
    tacturin: {
        chainId: 2390,
        network: 'tac-turin',
        ...tacTurinAddresses.coreAddresses,
        ...tacTurinAddresses.swapAddresses,
        ...tacTurinAddresses.peripheryAddresses,
        startBlock: 5066361
    },
    tac: {
        chainId: 239,
        network: 'tac',
        ...tacAddresses.coreAddresses,
        ...tacAddresses.swapAddresses,
        ...tacAddresses.peripheryAddresses,
        startBlock: 860000
    },
    linea: {
        chainId: 59144,
        network: 'linea',
        ...lineaAddresses.coreAddresses,
        ...lineaAddresses.swapAddresses,
        ...lineaAddresses.peripheryAddresses,
        startBlock: 17900000
    },
    plasma: {
        chainId: 9745,
        network: 'plasma-mainnet',
        ...plasmaAddresses.coreAddresses,
        ...plasmaAddresses.swapAddresses,
        ...plasmaAddresses.peripheryAddresses,
        startBlock: 510000
    },
    mantle: {
        chainId: 5000,
        network: 'mantle',
        ...mantleAddresses.coreAddresses,
        ...mantleAddresses.swapAddresses,
        ...mantleAddresses.peripheryAddresses,
        startBlock: 84500000
    },
    monad: {
        chainId: 143,
        network: 'monad',
        ...monadAddresses.coreAddresses,
        ...monadAddresses.swapAddresses,
        ...monadAddresses.peripheryAddresses,
        startBlock: 30858000
    },
    morph: {
        chainId: 2818,
        network: 'morph',
        ...morphAddresses.coreAddresses,
        ...morphAddresses.swapAddresses,
        ...morphAddresses.peripheryAddresses,
        startBlock: 5080000
    },
    polygon: {
        chainId: 137,
        network: 'matic',
        ...polygonAddresses.coreAddresses,
        ...polygonAddresses.swapAddresses,
        ...polygonAddresses.peripheryAddresses,
        startBlock: 86932985
    },
    sepolia: {
        chainId: 11155111,
        network: 'sepolia',
        ...sepoliaAddresses.coreAddresses,
        ...sepoliaAddresses.swapAddresses,
        ...sepoliaAddresses.peripheryAddresses,
        startBlock: 9000000
    }
}


export const NETWORKS = Object.keys(networks)
