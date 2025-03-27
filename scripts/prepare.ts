import fs from 'fs'
import path from 'path'
import Mustache from 'mustache'
import { networks } from './config'



// Read template
const template = fs.readFileSync(
  path.join(__dirname, '../template/subgraph.template.yaml'),
  'utf8'
)

function generateConfig(network: keyof typeof networks) {
  const config = networks[network]
  // Force string rendering for specific fields
  // @ts-ignore
  const output = Mustache.render(template, config, {}, {
    escape: (value: any) => {
      if (typeof value === 'string' && value.startsWith('0x')) {
        return value;
      }
      return value;
    }
  })
  fs.writeFileSync(path.join(__dirname, '../subgraph.yaml'), output)
}

// Get network from command line args
const network = process.argv[2] as keyof typeof networks || 'mainnet'
if (!networks[network]) {
  throw new Error(`Network ${network} not supported`)
}
console.log("Generating config for: ", networks[network])
generateConfig(network) 