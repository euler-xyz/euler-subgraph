import { getAddress } from "viem"
import * as fs from 'fs'
import * as path from 'path'

export function toSubAccountId(address: string, subAccount: string) {
    return Number(
        BigInt(getAddress(address)) ^ BigInt(getAddress(subAccount)),
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