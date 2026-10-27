const usage = 'Usage: pnpm run prepare <network>; pnpm run build <network>; pnpm run deploy <network> [test|swap]'

export function parseNetworkArguments(argv, networks) {
  const [command, network, fork] = argv
  if (!['prepare', 'build', 'deploy'].includes(command)
    || (command === 'deploy' ? argv.length < 2 || argv.length > 3 : argv.length !== 2)
    || !/^[a-z0-9]+$/.test(network) || !Object.hasOwn(networks, network)
    || (fork !== undefined && !['test', 'swap'].includes(fork))) throw new Error(usage)
  return { command, network, fork }
}

// All command arguments are validated before writing a manifest or invoking a tool.
export function runNetworkCommand({ argv, networks, run, env = process.env }) {
  // pnpm install invokes the prepare lifecycle without a selected network.
  if (argv.length === 1 && argv[0] === 'prepare'
    && env.npm_lifecycle_event === 'prepare' && ['install', 'ci'].includes(env.npm_command)) return
  const { command, network, fork } = parseNetworkArguments(argv, networks)
  run('bun', ['scripts/prepare.ts', network])
  if (command === 'prepare') return
  run('graph', ['codegen'])
  run('graph', ['build'])
  run('bun', ['scripts/catalog/cli.ts', 'receipt', network])
  if (command === 'deploy') run('bun', ['scripts/deploy.ts', network, ...(fork ? [fork] : [])])
}
