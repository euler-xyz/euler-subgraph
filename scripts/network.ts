import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { networks } from './config.ts'
import { runNetworkCommand } from './network-command.mjs'

try {
  runNetworkCommand({
    argv: process.argv.slice(2),
    networks,
    run: (program: string, args: string[]) => execFileSync(program, args, { cwd: fileURLToPath(new URL('..', import.meta.url)), stdio: 'inherit' })
  })
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Network command failed')
  process.exitCode = 1
}
