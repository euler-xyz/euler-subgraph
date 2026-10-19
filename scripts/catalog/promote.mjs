import { validateRelease } from './validate.mjs'
import { publishCatalog } from './publish.mjs'

// Only the explicitly invoked operator command calls this function.
export async function promoteAndPublish(selection, receipt, probes, remote, tag) {
  if (selection.channel !== 'stable') throw new Error('Promotion requires the stable channel')
  // Validate the exact candidate fully before any mutation; latest may still point elsewhere.
  await validateRelease({ ...selection, channel: 'candidate' }, receipt, probes)
  try { await tag(receipt.name, selection.version) }
  catch { throw new Error('Promotion outcome unconfirmed. Inspect the selected alias and use publish-only retry if promotion succeeded.') }
  try {
    return await publishCatalog(remote, () => validateRelease(selection, receipt, probes))
  } catch {
    throw new Error('Promotion succeeded; catalog publication failed or is unconfirmed. Retry catalog:publish without retagging.')
  }
}
