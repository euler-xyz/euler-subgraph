import { CatalogValidationError } from './errors.mjs'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, lstatSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { updateCatalog } from './catalog.mjs'

// One compare-and-swap attempt; retry the command to revalidate provider evidence.
export async function publishCatalog(remote, makeRecord, { beforePush = async () => {}, now = new Date() } = {}) {
  if (typeof remote !== 'string' || !remote || remote.startsWith('-') || /[\r\n]/.test(remote)) throw new CatalogValidationError('Invalid Git remote')
  if (/^https?:/.test(remote)) {
    let url
    try { url = new URL(remote) } catch { throw new CatalogValidationError('Invalid Git remote') }
    if (url.username || url.password || url.search || url.hash) throw new CatalogValidationError('Use Git credential helpers, not credentials in remote URLs')
  }
  const directory = mkdtempSync(join(tmpdir(), 'euler-catalog-'))
  const git = (...args) => execFileSync('git', args, { cwd: directory, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 60000, maxBuffer: 16 * 1024 * 1024 }).trim()
  try {
    git('init', '-q'); git('remote', 'add', 'origin', remote)
    let head = ''
    try { head = git('ls-remote', '--exit-code', 'origin', 'refs/heads/catalog').split(/\s/)[0] }
    catch (error) { if (error.status !== 2) throw new CatalogValidationError('Cannot read publication branch') }
    let previous = { schemaVersion: 1, revision: 'initial', publishedAt: now.toISOString(), deployments: [] }
    if (head) {
      git('fetch', '--quiet', 'origin', 'refs/heads/catalog')
      // A concurrent update between ls-remote and fetch must be retried, not overwritten.
      if (git('rev-parse', 'FETCH_HEAD') !== head) throw new CatalogValidationError('Publication changed; retry')
      git('checkout', '--quiet', '--detach', head)
      previous = JSON.parse(git('show', `${head}:v1/catalog.json`))
    }
    const record = await makeRecord()
    const catalog = updateCatalog(previous, record, now)
    if (JSON.stringify(catalog.deployments) === JSON.stringify(previous.deployments)) return { status: 'unchanged', revision: previous.revision }
    try {
      const entry = lstatSync(join(directory, 'v1'))
      if (!entry.isDirectory() || entry.isSymbolicLink()) throw new CatalogValidationError('Invalid catalog directory')
    } catch (error) { if (error.code !== 'ENOENT') throw error }
    mkdirSync(join(directory, 'v1'), { recursive: true })
    try {
      const entry = lstatSync(join(directory, 'v1/catalog.json'))
      if (!entry.isFile() || entry.isSymbolicLink()) throw new CatalogValidationError('Invalid catalog file')
    } catch (error) { if (error.code !== 'ENOENT') throw error }
    rmSync(join(directory, 'v1/catalog.json'), { force: true })
    writeFileSync(join(directory, 'v1/catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`)
    git('add', '--', 'v1/catalog.json')
    git('-c', 'user.name=Euler catalog publisher', '-c', 'user.email=catalog@users.noreply.github.com', '-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', `Publish catalog ${catalog.revision}`)
    await beforePush()
    try { git('push', '--porcelain', `--force-with-lease=refs/heads/catalog:${head}`, 'origin', 'HEAD:refs/heads/catalog') }
    catch { throw new CatalogValidationError('Catalog push unconfirmed or conflicted; retry publication to reconcile.') }
    return { status: 'published', revision: catalog.revision }
  } finally { rmSync(directory, { recursive: true, force: true }) }
}
