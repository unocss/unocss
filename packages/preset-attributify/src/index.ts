import { definePreset } from '@unocss/core'
import { autocompleteExtractorAttributify } from './autocomplete'
import { defaultIgnoreAttributes, extractorAttributify } from './extractor'
import type { AttributifyOptions } from './types'
import { variantAttributify } from './variant'

export * from './autocomplete'
export * from './extractor'
export * from './variant'
export * from './types'
export * from './jsx'

/**
 * This enables the attributify mode for other presets.
 *
 * @example
 *
 * ```html
 * <button
 *   bg="blue-400 hover:blue-500 dark:blue-500 dark:hover:blue-600"
 *   text="sm white"
 *   font="mono light"
 *   p="y-2 x-4"
 *   border="2 rounded blue-200"
 * >
 *   Button
 * </button>
 * ```
 *
 * @see https://unocss.dev/presets/attributify
 */
export const presetAttributify = definePreset((options: AttributifyOptions = {}) => {
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
})

export default presetAttributify
