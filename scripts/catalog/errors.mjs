// Only authored, credential-free validation messages belong in this type.
// Never include provider responses, child-process output or parser exception text.
export class CatalogValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'CatalogValidationError'
  }
}

export class CatalogPromotionError extends Error {
  constructor(stage, cause) {
    super(stage === 'tag'
      ? 'Promotion outcome unconfirmed. Inspect the selected alias and use publish-only retry if promotion succeeded.'
      : 'Promotion succeeded; catalog publication failed or is unconfirmed. Retry catalog:publish without retagging.', { cause })
    this.name = 'CatalogPromotionError'
    this.stage = stage
  }
}

const validationDetail = error => error instanceof CatalogValidationError ? ` ${error.message.replace(/[.!]$/, '')}.` : ''

export function catalogFailureMessage(command, error) {
  if (command === 'promote') {
    if (error instanceof CatalogPromotionError) return error.message + validationDetail(error.cause)
    return 'Promotion preflight failed; no tag was changed by this command.'
      + (validationDetail(error) || ' Check receipt, release, indexing and access.')
  }
  if (command === 'receipt') return 'Catalog receipt failed.' + validationDetail(error)
  if (command === 'publish') return 'Catalog publication failed or is unconfirmed.' + validationDetail(error)
    + ' Retry catalog:publish against the selected release to reconcile; check receipt, release, indexing, RPC and Git access.'
  if (command === 'import') return 'Catalog import failed or is unconfirmed.' + validationDetail(error)
    + ' Retry catalog:import for the selected release; check Goldsky API, indexing, RPC and Git access. This command never deploys or retags.'
  if (command === 'retire') return 'Catalog retirement failed or is unconfirmed.' + validationDetail(error)
    + ' Retry catalog:retire to reconcile; check Git access and the existing catalog.'
  return 'Catalog command failed.' + validationDetail(error)
}
