import { execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { Network, NETWORKS, networks } from './config'
import { formatVersion, parseVersion, Version } from './utils/utils'
import Mustache from 'mustache'

interface HotfixConfig {
  chain: string
  baseVersion: string
  graftBlock: number
  deploymentId?: string
  fork?: string
  description?: string
}

function getDeploymentIdFromVersion(network: Network, version: string, fork?: string): string | null {
  try {
    const subgraphName = fork ? `euler-v2-${network}-${fork}` : `euler-v2-${network}`
    
    // Try multiple approaches to get deployment ID
    // Approach 1: Try goldsky subgraph list with specific subgraph
    try {
      const result = execSync(`goldsky subgraph list ${subgraphName}`, { encoding: 'utf8' }).toString()
      const lines = result.split('\n')
      for (const line of lines) {
        if (line.includes(version) || line.includes(`/${version}`)) {
          // Try to extract deployment ID (IPFS hash format: Qm... or similar)
          const ipfsHashMatch = line.match(/(Qm[a-zA-Z0-9]{44})/)
          if (ipfsHashMatch) {
            return ipfsHashMatch[0]
          }
          // Try other hash formats (46 chars is common for deployment IDs)
          const hashMatch = line.match(/\b([a-zA-Z0-9]{46})\b/)
          if (hashMatch) {
            return hashMatch[0]
          }
          // Try to extract from URL if present
          const urlMatch = line.match(/https:\/\/[^\s]+/)
          if (urlMatch) {
            // Deployment ID might be in the URL path
            const pathMatch = urlMatch[0].match(/\/([a-zA-Z0-9]{46})\//)
            if (pathMatch) {
              return pathMatch[1]
            }
          }
        }
      }
    } catch (e) {
      // If specific subgraph list fails, try general list
    }
    
    // Approach 2: Try general goldsky subgraph list and filter
    try {
      const result = execSync('goldsky subgraph list', { encoding: 'utf8' }).toString()
      const lines = result.split('\n')
      for (const line of lines) {
        if (line.includes(subgraphName) && (line.includes(version) || line.includes(`/${version}`))) {
          const ipfsHashMatch = line.match(/(Qm[a-zA-Z0-9]{44})/)
          if (ipfsHashMatch) {
            return ipfsHashMatch[0]
          }
          const hashMatch = line.match(/\b([a-zA-Z0-9]{46})\b/)
          if (hashMatch) {
            return hashMatch[0]
          }
        }
      }
    } catch (e) {
      // Continue to manual instructions
    }
    
    console.warn(`Could not automatically find deployment ID for ${subgraphName} v${version}`)
    console.warn('Please provide the deployment ID manually in the hotfix config file')
    console.warn('You can find it by running: goldsky subgraph list')
    return null
  } catch (error) {
    console.error('Error getting deployment ID:', error)
    return null
  }
}

function loadHotfixConfig(configPath: string): HotfixConfig {
  if (!existsSync(configPath)) {
    throw new Error(`Hotfix config file not found: ${configPath}`)
  }
  
  const config = JSON.parse(readFileSync(configPath, 'utf8')) as HotfixConfig
  
  if (!config.chain || !config.baseVersion || !config.graftBlock) {
    throw new Error('Hotfix config must include: chain, baseVersion, and graftBlock')
  }
  
  return config
}

function generateSubgraphWithGrafting(network: Network, hotfixConfig: HotfixConfig) {
  // First, prepare the network configuration (same as prepare.ts)
  const templatePath = join(__dirname, '../template/subgraph.template.yaml')
  const template = readFileSync(templatePath, 'utf8')
  
  const config = networks[network]
  if (!config) {
    throw new Error(`Network ${network} not found in config`)
  }
  
  // Calculate start block (one block after graft block)
  const startBlock = hotfixConfig.graftBlock + 1
  
  // Prepare template variables with updated startBlock
  const templateVars = {
    ...config,
    startBlock
  }
  
  // Render template (same as prepare.ts)
  const output = Mustache.render(template, templateVars, {}, {
    escape: (value: any) => {
      if (typeof value === 'string' && value.startsWith('0x')) {
        return value
      }
      return value
    }
  })
  
  // Add grafting configuration to the end of the file
  let finalOutput = output.trimEnd()
  
  // Remove any existing features or graft sections
  finalOutput = finalOutput.replace(/\nfeatures:[\s\S]*?(?=\n[a-zA-Z]|\n$)/, '')
  finalOutput = finalOutput.replace(/\ngraft:[\s\S]*?(?=\n[a-zA-Z]|\n$)/, '')
  
  // Add features and graft sections at the end
  const graftSection = `
features:
  - grafting
graft:
  base: ${hotfixConfig.deploymentId || 'DEPLOYMENT_ID_REQUIRED'}
  block: ${hotfixConfig.graftBlock}
`
  finalOutput = finalOutput + graftSection
  
  // Update all startBlock values in data sources (in case some weren't updated)
  finalOutput = finalOutput.replace(
    /startBlock:\s*\d+/g,
    `startBlock: ${startBlock}`
  )
  
  const outputPath = join(__dirname, '../subgraph.yaml')
  writeFileSync(outputPath, finalOutput)
  console.log(`Generated subgraph.yaml with grafting configuration`)
  console.log(`  Graft block: ${hotfixConfig.graftBlock}`)
  console.log(`  Start block: ${startBlock}`)
  console.log(`  Base deployment: ${hotfixConfig.deploymentId || 'NOT SET - PLEASE UPDATE'}`)
}

function deployHotfix(network: Network, hotfixConfig: HotfixConfig) {
  const subgraphName = hotfixConfig.fork 
    ? `euler-v2-${network}-${hotfixConfig.fork}` 
    : `euler-v2-${network}`
  
  // Get current version and increment patch
  const baseVersion = parseVersion(hotfixConfig.baseVersion)
  const newVersion: Version = {
    major: baseVersion.major,
    minor: baseVersion.minor,
    patch: baseVersion.patch + 1
  }
  const versionString = formatVersion(newVersion)
  
  console.log(`\n=== Hotfix Deployment ===`)
  console.log(`Network: ${network}`)
  console.log(`Base version: ${hotfixConfig.baseVersion}`)
  console.log(`New version: ${versionString}`)
  console.log(`Graft block: ${hotfixConfig.graftBlock}`)
  console.log(`Deployment ID: ${hotfixConfig.deploymentId || 'NOT SET'}`)
  console.log(`Subgraph: ${subgraphName}`)
  
  if (!hotfixConfig.deploymentId) {
    console.error('\n❌ ERROR: Deployment ID is required for grafting!')
    console.error('Please update the hotfix config file with the deployment ID.')
    console.error('You can find it by running: goldsky subgraph list <subgraph-name>')
    process.exit(1)
  }
  
  try {
    // Generate subgraph.yaml with grafting
    generateSubgraphWithGrafting(network, hotfixConfig)
    
    // Build the subgraph
    console.log('\nBuilding subgraph...')
    execSync('graph build', { stdio: 'inherit', cwd: join(__dirname, '..') })
    
    // Deploy
    console.log(`\nDeploying ${subgraphName} v${versionString}...`)
    execSync(`goldsky subgraph deploy ${subgraphName}/${versionString}`, { 
      stdio: 'inherit',
      cwd: join(__dirname, '..')
    })
    
    console.log(`\n✅ Successfully deployed hotfix v${versionString}`)
    console.log(`\n⚠️  Remember: After the hotfix is stable, deploy a non-grafted version for long-term maintenance.`)
  } catch (error) {
    console.error('Error deploying hotfix:', error)
    process.exit(1)
  }
}

// Main execution
const configFile = process.argv[2]

if (!configFile) {
  console.error('Usage: bun scripts/deploy-hotfix.ts <hotfix-config.json>')
  console.error('Example: bun scripts/deploy-hotfix.ts hotfix/mainnet-1.0.12.json')
  process.exit(1)
}

const configPath = join(process.cwd(), configFile)
const hotfixConfig = loadHotfixConfig(configPath)

const network = hotfixConfig.chain as Network
if (!NETWORKS.includes(network)) {
  console.error(`Invalid network: ${network}. Must be one of: ${NETWORKS.join(', ')}`)
  process.exit(1)
}

// Try to get deployment ID if not provided
if (!hotfixConfig.deploymentId) {
  console.log('Attempting to fetch deployment ID...')
  const deploymentId = getDeploymentIdFromVersion(network, hotfixConfig.baseVersion, hotfixConfig.fork)
  if (deploymentId) {
    hotfixConfig.deploymentId = deploymentId
    console.log(`Found deployment ID: ${deploymentId}`)
    // Update the config file
    const updatedConfig = { ...hotfixConfig, deploymentId }
    writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2))
  }
}

deployHotfix(network, hotfixConfig)

