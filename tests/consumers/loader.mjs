import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { registerHooks, stripTypeScriptTypes } from 'node:module'
import { isAbsolute, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// Import the selected checkouts' source without copying their parsers into this suite.
export const roots = Object.fromEntries(['SDK', 'LITE', 'DOCS'].map(name => {
  const value = process.env[`EULER_${name}_ROOT`]
  if (!value || !isAbsolute(value) || !existsSync(resolve(value, 'package.json'))) {
    throw new Error(`Set EULER_${name}_ROOT to an absolute checkout path with dependencies installed`)
  }
  return [name.toLowerCase(), realpathSync(value)]
}))
const owned = path => Object.values(roots).some(root => path === root || path.startsWith(root + sep))
export const sourceUrl = (repo, path) => pathToFileURL(resolve(roots[repo], path)).href

registerHooks({
  resolve(specifier, context, nextResolve) {
    const parent = context.parentURL?.startsWith('file:') ? fileURLToPath(context.parentURL) : ''
    if (specifier.startsWith('~/') && parent.startsWith(roots.lite + sep)) {
      specifier = sourceUrl('lite', specifier.slice(2))
    }
    try { return nextResolve(specifier, context) }
    catch (error) {
      if (error.code !== 'ERR_MODULE_NOT_FOUND' || !context.parentURL
        || !(specifier.startsWith('.') || specifier.startsWith('file:'))) throw error
      const url = new URL(specifier, context.parentURL)
      if (url.protocol !== 'file:') throw error
      const path = fileURLToPath(url)
      if (!owned(path)) throw error
      const candidates = path.endsWith('.js') ? [path.slice(0, -3) + '.ts'] : [path + '.ts']
      const found = candidates.find(existsSync)
      if (!found) throw error
      return nextResolve(pathToFileURL(found).href, context)
    }
  },
  load(url, context, nextLoad) {
    if (url.startsWith('file:') && url.endsWith('.ts') && owned(fileURLToPath(url))) {
      return {
        format: 'module',
        source: stripTypeScriptTypes(readFileSync(fileURLToPath(url), 'utf8'), { mode: 'transform', sourceUrl: url }),
        shortCircuit: true,
      }
    }
    return nextLoad(url, context)
  },
})
