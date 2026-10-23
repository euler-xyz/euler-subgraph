import { CatalogValidationError, CatalogPromotionError } from './errors.mjs'
import { validateRelease } from './validate.mjs'
import { publishCatalog } from './publish.mjs'

// Only the explicitly invoked operator command calls this function.
export async function promoteAndPublish(selection, receipt, probes, remote, tag) {
  if (selection.channel !== 'stable') throw new CatalogValidationError('Promotion requires the stable channel')
  // Validate the exact candidate fully before any mutation; latest may still point elsewhere.
  await validateRelease({ ...selection, channel: 'candidate' }, receipt, probes)
  try { await tag(receipt.name, selection.version) }
  catch { throw new CatalogPromotionError('tag') }
  try {
    return await publishCatalog(remote, () => validateRelease(selection, receipt, probes))
  } catch (error) {
    throw new CatalogPromotionError('publication', error)
  }
}
