import { CatalogValidationError } from './errors.mjs'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, rmSync, realpathSync, renameSync, lstatSync } from 'node:fs'
import { resolve, dirname, relative, isAbsolute } from 'node:path'
import { fingerprintManifest, manifestScope } from './validate.mjs'

export async function writeBuildReceipt({ root, network, config, parseManifest }) {
  if (!/^[a-z0-9]+$/.test(network)) throw new CatalogValidationError('Invalid network key')
  const receiptPath = resolve(root, '.catalog', `${network}.json`)
  const temporaryPath = `${receiptPath}.tmp`
  rmSync(receiptPath, { force: true })
  rmSync(temporaryPath, { force: true })
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 10000 }).trim()
  try {
    if (git('status', '--porcelain', '--untracked-files=all')) return { status: 'dirty' }
    const sourceCommit = git('rev-parse', 'HEAD')
    if (!/^[a-f0-9]{40}$/.test(sourceCommit) || !Number.isSafeInteger(config.chainId) || config.chainId <= 0
      || !Number.isSafeInteger(config.startBlock) || config.startBlock < 0) throw new CatalogValidationError('Invalid source configuration')
    const buildPath = resolve(root, 'build')
    if (lstatSync(buildPath).isSymbolicLink()) throw new CatalogValidationError('Build directory must be local')
    const buildRoot = realpathSync(buildPath)
    const readArtifact = file => {
      if (typeof file !== 'string' || !file) throw new CatalogValidationError('Invalid artifact path')
      const path = realpathSync(resolve(buildRoot, file))
      const child = relative(buildRoot, path)
      if (child.startsWith('..') || isAbsolute(child)) throw new CatalogValidationError('Artifact outside build directory')
      return readFileSync(path)
    }
    const manifest = parseManifest(readArtifact('subgraph.yaml').toString('utf8'))
    let startBlock = config.startBlock
    if (manifest.graft !== undefined) {
      const graft = manifest.graft
      if (!graft || typeof graft.base !== 'string' || !/^[A-Za-z0-9]+$/.test(graft.base)
        || !Number.isSafeInteger(graft.block) || graft.block < config.startBlock || graft.block >= Number.MAX_SAFE_INTEGER
        || !Array.isArray(manifest.features) || !manifest.features.includes('grafting')) throw new CatalogValidationError('Invalid graft configuration')
      startBlock = graft.block + 1
    } else if (Array.isArray(manifest.features) && manifest.features.includes('grafting')) throw new CatalogValidationError('Missing graft configuration')
    const scope = manifestScope(manifest)
    const expected = [config.eVaultFactory, config.eulerEarnFactory, ...(config.securitizeFactory ? [config.securitizeFactory] : [])].map(address => String(address).toLowerCase()).sort()
    if (scope.some(row => row.network !== config.network || row.startBlock !== startBlock)
      || JSON.stringify(scope.map(row => row.address).sort()) !== JSON.stringify(expected)
      || (manifest.templates ?? []).some(row => row.network !== config.network)) throw new CatalogValidationError('Build scope differs from selected network configuration')
    const manifestFingerprint = await fingerprintManifest(manifest, readArtifact)
    // Do not attribute artifacts to a source checkout that changed while being read.
    if (git('status', '--porcelain', '--untracked-files=all') || git('rev-parse', 'HEAD') !== sourceCommit) return { status: 'dirty' }
    const receipt = { schemaVersion: 1, name: `euler-simple-${network}`, network, chainId: config.chainId, sourceCommit, startBlock, scope, manifestFingerprint }
    mkdirSync(dirname(receiptPath), { recursive: true })
    writeFileSync(temporaryPath, `${JSON.stringify(receipt, null, 2)}\n`)
    renameSync(temporaryPath, receiptPath)
    return { status: 'written', receipt }
  } catch (error) {
    rmSync(receiptPath, { force: true })
    rmSync(temporaryPath, { force: true })
    throw error
  }
}
