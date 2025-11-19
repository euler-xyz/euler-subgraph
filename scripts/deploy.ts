import { execSync } from 'child_process'
import { Network, NETWORKS, Version } from './config'
import { compareVersions, formatVersion, parseVersion } from './utils/utils'
import { existsSync, readFileSync } from 'fs'

const DEPLOYMENTS_FILE = 'deployments.json'
function getLatestVersion(network: Network, subgraphName: string): Version {
  try {
    if (existsSync(DEPLOYMENTS_FILE)) {
      const deployments = JSON.parse(readFileSync(DEPLOYMENTS_FILE, 'utf8'))
      const deployment = deployments.find((deployment: any) => deployment.network === network)
      if (deployment) {
        return parseVersion(deployment.version)
      }
    } else {
      console.warn('Deployments file not found, using goldsky subgraph list')
    }

    const result = execSync('goldsky subgraph list').toString()
    const lines = result.split('\n')
      .filter(line => line.includes(subgraphName))
      .map(line => {
        console.log(">>", line)
        // Match both regular versions (1.0.12) and hotfix versions (1.0.12.1)
        const versionMatch = line.match(/(?:v|\/)((\d+)\.(\d+)\.(\d+)(?:\.(\d+))?)/)
        return versionMatch ? parseVersion(versionMatch[1]) : null
      })
      .filter((version): version is Version => version !== null)
      .sort(compareVersions)
    if (lines.length > 0) {
      return lines[0]
    }

    return { major: 1, minor: 0, patch: 0 }
  } catch (error) {
    console.error('Error getting latest version:', error)
    return { major: 1, minor: 0, patch: 0 }
  }
}

function incrementVersion(version: Version): Version {
  // For regular deployments, increment patch and remove hotfix
  return {
    major: version.major,
    minor: version.minor,
    patch: version.patch + 1,
    hotfix: undefined  // Remove hotfix for regular deployments
  }
}

function deployNewVersion(network: Network, fork: string) {
  const subgraphName = fork ? `euler-v2-${network}-${fork}` : `euler-v2-${network}`
  const currentVersion = getLatestVersion(network, subgraphName)
  const newVersion = incrementVersion(currentVersion)
  const versionString = formatVersion(newVersion)


  console.log(`Current version: v${formatVersion(currentVersion)}`)
  console.log(`New version: v${versionString}`)
  try {
    console.log(`Deploying ${subgraphName} v${versionString}...`)
    console.log(`>> goldsky subgraph deploy ${subgraphName}/${versionString}`)
    execSync(`goldsky subgraph deploy ${subgraphName}/${versionString}`, { stdio: 'inherit' })
    console.log(`Successfully deployed v${versionString}`)
  } catch (error) {
    console.error('Error deploying: version: ', versionString, ' fork: ', fork, ' error: ', error)
    // @ts-ignore
    process.exit(1)
  }
}

// Get network from command line args
const network = process.argv[2] as Network
const fork = process.argv[3]

if (!NETWORKS.includes(network)) {
  console.error(`Invalid network. Must be one of: ${NETWORKS.join(', ')}`)
  process.exit(1)
}

deployNewVersion(network, fork) 