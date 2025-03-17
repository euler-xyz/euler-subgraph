import { getAddress } from "viem"

export function toSubAccountId(address: string, subAccount: string) {
    return Number(
        BigInt(getAddress(address)) ^ BigInt(getAddress(subAccount)),
      )
}

export function getSubgraphUrl(chainName: string) {
    switch (chainName) {
        case "base":
            return process.env.SUBGRAPH_BASE_URI || ""
        case "mainnet":
            return process.env.SUBGRAPH_MAINNET_URI || ""
        case "swell":
            return process.env.SUBGRAPH_SWELLCHAIN_URI || ""
        case "sonic":
            return process.env.SUBGRAPH_SONIC_URI || ""
        case "arbitrum":
            return process.env.SUBGRAPH_ARBITRUM_URI || ""
        case "avalanche":
            return process.env.SUBGRAPH_AVALANCHE_URI || ""    
        default:
            throw new Error(`Subgraph not available for chain ${chainName}`)
    }
}