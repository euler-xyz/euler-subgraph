import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

execFileSync('bun', [fileURLToPath(new URL('./network.ts', import.meta.url)), 'build', ...process.argv.slice(2)], { stdio: 'inherit' })
