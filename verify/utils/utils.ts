import { getAddress } from "viem"
import * as fs from 'fs'
import * as path from 'path'

// Address prefix is the first 19 bytes, shared by main address and all sub-accounts
const ADDRESS_PREFIX_LENGTH = 19

export function getAddressPrefix(address: string): string {
    const checksummed = getAddress(address)
    // Return first 19 bytes (2 chars for '0x' + 38 hex chars = 40 total for 19 bytes... wait)
    // Actually: 0x + 19 bytes * 2 hex chars = 0x + 38 = 40 chars total
    return checksummed.slice(0, 2 + ADDRESS_PREFIX_LENGTH * 2).toLowerCase()
}

export function toSubAccountId(addressPrefix: string, subAccount: string) {
    // Pad addressPrefix to full address length for XOR comparison
    const paddedPrefix = addressPrefix.padEnd(42, '0')
    return Number(
        BigInt(paddedPrefix) ^ BigInt(getAddress(subAccount)),
    )
}

interface DeploymentInfo {
    network: string
    url: string
    version: string
}

export function getValidChains(): string[] {
    try {
        const deploymentsPath = path.join(process.cwd(), 'deployments.json')
        if (!fs.existsSync(deploymentsPath)) {
            console.error('deployments.json does not exist. Please generate it using:')
            console.error('pnpm generate:deployments')
            return []
        }

        const deploymentsContent = fs.readFileSync(deploymentsPath, 'utf-8')
        const deployments: DeploymentInfo[] = JSON.parse(deploymentsContent)
        return deployments.map(d => d.network)
    } catch (error) {
        console.error(`Error reading deployments.json:`, error)
        return []
    }
}

export function getSubgraphUrl(chainName: string): string {
    try {
        const deploymentsPath = path.join(process.cwd(), 'deployments.json')
        if (!fs.existsSync(deploymentsPath)) {
            console.error('deployments.json does not exist. Please generate it using:')
            console.error('pnpm generate:deployments')
            throw new Error('deployments.json not found')
        }

        const deploymentsContent = fs.readFileSync(deploymentsPath, 'utf-8')
        const deployments: DeploymentInfo[] = JSON.parse(deploymentsContent)

        const deployment = deployments.find(d => d.network === chainName)
        if (!deployment) {
            throw new Error(`Subgraph not available for chain ${chainName}`)
        }

        return deployment.url
    } catch (error) {
        console.error(`Error reading deployments.json:`, error)
        throw new Error(`Failed to get subgraph URL for chain ${chainName}`)
    }
}