import type { Preset } from '@unocss/core'
import { autocompleteExtractorAttributify } from './autocomplete'
import { defaultIgnoreAttributes, extractorAttributify } from './extractor'
import type { AttributifyOptions } from './types'
import { variantAttributify } from './variant'

export * from './autocomplete'
export * from './extractor'
export * from './variant'
export * from './types'
export * from './jsx'

function presetAttributify(options: AttributifyOptions = {}): Preset {
  options.strict = options.strict ?? false
  options.prefix = options.prefix ?? 'un-'
  options.prefixedOnly = options.prefixedOnly ?? false
  options.nonValuedAttribute = options.nonValuedAttribute ?? true
  options.ignoreAttributes = options.ignoreAttributes ?? defaultIgnoreAttributes

  const variants = [
    variantAttributify(options),
  ]
  const extractors = [
    extractorAttributify(options),
  ]
  const autocompleteExtractors = [
    autocompleteExtractorAttributify(options),
  ]

  return {
    name: '@unocss/preset-attributify',
    enforce: 'post',
    variants,
    extractors,
    options,
    autocomplete: {
      extractors: autocompleteExtractors,
    },
    extractorDefault: options.strict ? false : undefined,
  }
}

export { presetAttributify }
export default presetAttributify
