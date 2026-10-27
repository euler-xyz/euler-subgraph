import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync, existsSync, rmSync, chmodSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join, delimiter } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { networks } from '../../scripts/config.ts'
import { runNetworkCommand } from '../../scripts/network-command.mjs'

const baseline = JSON.parse(readFileSync(new URL('./fixtures/network-config.json', import.meta.url)))
const fields = ['chainId', 'network', 'eVaultFactory', 'eulerEarnFactory', 'securitizeFactory', 'startBlock']
const zero = `0x${'0'.repeat(40)}`
const prepare = network => ['bun', ['scripts/prepare.ts', network]]
const build = network => [prepare(network), ['graph', ['codegen']], ['graph', ['build']], ['bun', ['scripts/catalog/cli.ts', 'receipt', network]]]

test('inlined existing network configuration preserves selected addresses, network and start block', () => {
  // This migration fixture checks existing networks; adding another entry needs no fixture change.
  for (const [name, ...values] of baseline) {
    assert.deepEqual(fields.map(field => networks[name][field] ?? null), values, name)
  }
  for (const config of Object.values(networks)) {
    assert.deepEqual(Object.keys(config).sort(), fields.filter(field => config[field] !== undefined).sort())
    assert.ok(Number.isSafeInteger(config.chainId) && config.chainId > 0)
    assert.ok(Number.isSafeInteger(config.startBlock) && config.startBlock >= 0)
    assert.match(config.network, /^[a-z0-9-]+$/)
    for (const field of ['eVaultFactory', 'eulerEarnFactory', 'securitizeFactory']) {
      if (config[field] !== undefined) assert.match(config[field], /^0x[a-f0-9]{40}$/i)
    }
    assert.notEqual(config.securitizeFactory, zero)
  }
  assert.equal(networks.polygon.securitizeFactory, undefined)
  assert.equal(networks.morph.securitizeFactory, undefined)
})

test('generic commands support configured networks and a newly added key without package scripts', () => {
  const configured = { ...networks, newchain: { ...networks.base, chainId: 12345, network: 'new-chain' } }
  for (const network of ['mainnet', 'polygon', 'morph', 'newchain']) {
    for (const command of ['prepare', 'build', 'deploy']) {
      for (const fork of command === 'deploy' ? [undefined, 'test', 'swap'] : [undefined]) {
        const calls = []
        runNetworkCommand({ argv: [command, network, ...(fork ? [fork] : [])], networks: configured, run: (program, args) => calls.push([program, args]), env: {} })
        const expected = command === 'prepare' ? [prepare(network)] : build(network)
        if (command === 'deploy') expected.push(['bun', ['scripts/deploy.ts', network, ...(fork ? [fork] : [])]])
        assert.deepEqual(calls, expected)
      }
    }
  }
  const { scripts } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url)))
  for (const command of ['prepare', 'build', 'deploy']) assert.equal(scripts[command], `bun scripts/network.ts ${command}`)
})

test('network commands reject missing, unknown, shell-like and excess arguments before any tool invocation', () => {
  const invalid = [[], ['unknown', 'mainnet'], ['deploy', 'mainnet', 'test', 'extra'], ['build', 'mainnet', 'test']]
  for (const command of ['prepare', 'build', 'deploy']) {
    for (const network of [undefined, 'missing', 'constructor', '__proto__', '../mainnet', 'mainnet;touch /tmp/sentinel']) {
      invalid.push([command, ...(network === undefined ? [] : [network])])
    }
    invalid.push([command, 'mainnet', '--dry-run'], [command, 'mainnet', '--unexpected'])
  }
  for (const fork of ['', 'latest', 'test;touch /tmp/sentinel', '$(touch /tmp/sentinel)']) invalid.push(['deploy', 'mainnet', fork])
  for (const argv of invalid) {
    const calls = []
    assert.throws(() => runNetworkCommand({ argv, networks, run: (...args) => calls.push(args), env: {} }), /Usage:/)
    assert.deepEqual(calls, [], JSON.stringify(argv))
  }
})

test('pnpm installation prepare lifecycle is inert; explicit prepare still requires a network', () => {
  const calls = []
  const options = { argv: ['prepare'], networks, run: (...args) => calls.push(args) }
  for (const npm_command of ['install', 'ci']) {
    runNetworkCommand({ ...options, env: { npm_lifecycle_event: 'prepare', npm_command } })
  }
  assert.deepEqual(calls, [])
  assert.throws(() => runNetworkCommand({ ...options, env: { npm_lifecycle_event: 'prepare', npm_command: 'run-script' } }), /Usage:/)
})

test('codegen, build and receipt process failures stop before deployment', () => {
  for (let failed = 0; failed < 4; failed++) {
    const calls = []
    assert.throws(() => runNetworkCommand({ argv: ['deploy', 'mainnet'], networks, env: {}, run: (program, args) => {
      calls.push([program, args])
      if (calls.length === failed + 1) throw new Error('Tool failed')
    } }), /Tool failed/)
    assert.deepEqual(calls, build('mainnet').slice(0, failed + 1))
  }
})

test('actual generic CLI forwards argument arrays and rejects a deployment flag without starting a tool', () => {
  const directory = mkdtempSync(join(tmpdir(), 'subgraph-network-cli-'))
  try {
    const log = join(directory, 'calls.jsonl')
    for (const program of ['bun', 'graph']) {
      const executable = join(directory, program)
      writeFileSync(executable, `#!${process.execPath}\nrequire('node:fs').appendFileSync(process.env.SUBGRAPH_TEST_CALLS, JSON.stringify([${JSON.stringify(program)}, process.argv.slice(2)])+'\\n')\n`)
      chmodSync(executable, 0o755)
    }
    const cli = fileURLToPath(new URL('../../scripts/network.ts', import.meta.url))
    const env = { ...process.env, PATH: `${directory}${delimiter}${process.env.PATH}`, SUBGRAPH_TEST_CALLS: log }
    let result = spawnSync(process.execPath, [cli, 'deploy', 'mainnet', '--dry-run'], { env, encoding: 'utf8' })
    assert.equal(result.status, 1, result.stderr)
    assert.equal(existsSync(log), false)
    result = spawnSync(process.execPath, [cli, 'deploy', 'mainnet', 'test'], { env, encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    assert.deepEqual(readFileSync(log, 'utf8').trim().split('\n').map(line => JSON.parse(line)), [
      ...build('mainnet'), ['bun', ['scripts/deploy.ts', 'mainnet', 'test']],
    ])
  } finally { rmSync(directory, { recursive: true, force: true }) }
})
