import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { networks } from '../config'
import { runCatalogCommand } from './command.mjs'

const root = resolve(import.meta.dir, '../..')
const run = (program: string, args: string[]) => execFileSync(program, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 60000, maxBuffer: 16 * 1024 * 1024 }).trim()
process.exitCode = await runCatalogCommand({ argv: process.argv.slice(2), networks, root, run, parseManifest: (text: string) => Bun.YAML.parse(text) })
