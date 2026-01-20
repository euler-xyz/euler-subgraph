import { execSync } from 'child_process'
import { networks } from './config'

const network = process.argv[2]

if (!network) {
  console.error('Usage: bun scripts/build.ts <network>')
  console.error(`Available networks: ${Object.keys(networks).join(', ')}`)
  process.exit(1)
}

if (!networks[network as keyof typeof networks]) {
  console.error(`Unknown network: ${network}`)
  console.error(`Available networks: ${Object.keys(networks).join(', ')}`)
  process.exit(1)
}

console.log(`Building for ${network}...`)

// Run prepare (generates subgraph.yaml)
execSync(`bun scripts/prepare.ts ${network}`, { stdio: 'inherit' })

// Run codegen (generates types from schema and ABIs)
execSync('graph codegen', { stdio: 'inherit' })

// Run graph build
execSync('graph build', { stdio: 'inherit' })

console.log(`Build complete for ${network}`)

