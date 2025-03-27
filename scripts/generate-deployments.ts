import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { Network, NETWORKS } from './config'
import { parseVersion } from './utils/utils'


interface DeploymentInfo {
    network: string
    url: string
    version: string
}

function getLatestDeployment(network: Network): DeploymentInfo | null {
    try {
        const result = execSync('goldsky subgraph list').toString()
        const lines = result.split('\n')
            .filter(line => line.includes(`euler-v2-${network}`))
            .map(line => {
                console.log(">>", line)
                const urlMatch = line.match(/https:\/\/[^\s]+/)
                const versionMatch = line.match(/(?:v|\/)((\d+)\.(\d+)\.(\d+))/)

                return {
                    url: urlMatch ? urlMatch[0] : null,
                    version: versionMatch ? versionMatch[1] : null
                }
            })
            .filter(info => info.url && info.version)
            .sort((a, b) => {
                const versionA = parseVersion(a.version!)
                const versionB = parseVersion(b.version!)
                if (versionA.major !== versionB.major) return versionB.major - versionA.major
                if (versionA.minor !== versionB.minor) return versionB.minor - versionA.minor
                return versionB.patch - versionA.patch
            })

        if (lines.length > 0) {
            console.log(`Latest version for ${network}:`, lines[0].version)
            return {
                network,
                url: lines[0].url!,
                version: lines[0].version!
            }
        }
        return null
    } catch (error) {
        console.error(`Error getting deployment for ${network}:`, error)
        return null
    }
}

function generateDeploymentsJson() {
    const deployments: DeploymentInfo[] = []

    for (const network of NETWORKS) {
        const deployment = getLatestDeployment(network)
        if (deployment) {
            deployments.push(deployment)
        }
    }

    const outputPath = path.join(process.cwd(), 'deployments.json')
    fs.writeFileSync(outputPath, JSON.stringify(deployments, null, 2))
    console.log('Deployments information has been saved to deployments.json')
}

generateDeploymentsJson() 