import type { Preset } from '@unocss/core'
import { extractorSplit } from '@unocss/core'
import { extractorAttributify } from './extractor'
import type { AttributifyOptions } from './types'
import { variantAttributify } from './variant'

export * from './extractor'
export * from './variant'
export * from './types'

const preset = (options: AttributifyOptions = {}): Preset => {
  options.strict = options.strict ?? false
  options.prefix = options.prefix ?? 'un-'
  options.prefixedOnly = options.prefixedOnly ?? false
  options.nonValuedAttribute = options.nonValuedAttribute ?? true
  options.ignoreAttributes = options.ignoreAttributes ?? []

  const variants = [
    variantAttributify(options),
  ]
  const extractors = [
    extractorAttributify(options),
  ]

  if (!options.strict)
    extractors.unshift(extractorSplit)

  return {
    name: '@unocss/preset-attributify',
    variants,
    extractors,
    options,
  }
}

export default preset
