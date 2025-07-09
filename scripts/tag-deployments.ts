import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { extractSubgraphInfo } from './utils/utils'

const DEPLOYMENTS_FILE = 'deployments.json'
const TAG_NAME = 'latest'

function tagDeployments() {
    const deployments = JSON.parse(readFileSync(DEPLOYMENTS_FILE, 'utf8'))

    for (const deployment of deployments) {
        try {
            const { name, version } = extractSubgraphInfo(deployment.url)
            console.log(`Tagging ${name} v${version}...`)
            console.log(`>> goldsky subgraph tag create ${name}/${version} --tag ${TAG_NAME}`)
            execSync(`goldsky subgraph tag create ${name}/${version} --tag ${TAG_NAME}`, { stdio: 'inherit' })
            console.log(`Successfully tagged v${version}`)
        } catch (error) {
            console.error('Error tagging:  ', deployment, ' error: ', error)
            // @ts-ignore
            process.exit(1)
        }
    }
}

tagDeployments()