import { variantMatcher } from '@unocss/preset-mini/utils'

export const variantFilePseudoElement = variantMatcher('file', input => `${input}::file-selector-button`)
