import { execSync } from 'child_process'
import { networks } from './prepare';

const NETWORKS = Object.keys(networks)

type Network = typeof NETWORKS[number]
type Version = { major: number; minor: number; patch: number }

function parseVersion(versionStr: string): Version {
  const [major = 0, minor = 0, patch = 0] = versionStr.split('.').map(Number)
  return { major, minor, patch }
}

function formatVersion(version: Version): string {
  return `${version.major}.${version.minor}.${version.patch}`
}

function compareVersions(a: Version, b: Version): number {
  if (a.major !== b.major) return b.major - a.major
  if (a.minor !== b.minor) return b.minor - a.minor
  return b.patch - a.patch
}

function getLatestVersion(network: Network): Version {
  try {
    const result = execSync('goldsky subgraph list').toString()
    const lines = result.split('\n')
      .filter(line => line.includes(`euler-v2-${network}`))
      .map(line => {
        console.log(">>", line)
        const versionMatch = line.match(/(?:v|\/)((\d+)\.(\d+)\.(\d+))/)
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
  return {
    major: version.major,
    minor: version.minor,
    patch: version.patch + 1  // Increment patch, keeping major and minor the same
  }
}

function deployNewVersion(network: Network, isTest: boolean = false) {
  const currentVersion = getLatestVersion(network)
  const newVersion = incrementVersion(currentVersion)
  const versionString = formatVersion(newVersion)
  const subgraphName = isTest ? `euler-v2-${network}-test` : `euler-v2-${network}`

  console.log(`Current version: v${formatVersion(currentVersion)}`)
  console.log(`New version: v${versionString}`)
  try {
    console.log(`Deploying ${subgraphName} v${versionString}...`)
    console.log(`>> goldsky subgraph deploy ${subgraphName}/${versionString}`)
    execSync(`goldsky subgraph deploy ${subgraphName}/${versionString}`, { stdio: 'inherit' })
    console.log(`Successfully deployed v${versionString}`)
  } catch (error) {
    console.error('Error deploying:', error)
    // @ts-ignore
    process.exit(1)
  }
}

// Get network from command line args
const network = process.argv[2] as Network
const isTest = process.argv[3] === 'test'

if (!NETWORKS.includes(network)) {
  console.error(`Invalid network. Must be one of: ${NETWORKS.join(', ')}`)
  process.exit(1)
}

deployNewVersion(network, isTest) 