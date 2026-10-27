import fs from 'fs'
import path from 'path'
import Mustache from 'mustache'
import { networks, type Network } from './config'
import { parseNetworkArguments } from './network-command.mjs'

const { network } = parseNetworkArguments(['prepare', ...process.argv.slice(2)], networks)
const config = networks[network as Network]
const template = fs.readFileSync(path.join(import.meta.dir, '../template/subgraph.template.yaml'), 'utf8')
const output = Mustache.render(template, config)
fs.writeFileSync(path.join(import.meta.dir, '../subgraph.yaml'), output)
console.log(`Generated subgraph.yaml for ${network}`)
