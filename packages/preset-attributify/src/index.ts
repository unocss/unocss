import { extractorSplit, Preset } from '@unocss/core'
import { extractorAttributify } from './extractor'
import { AttributifyOptions } from './types'
import { variantAttributify } from './variant'

export * from './extractor'
export * from './variant'
export * from './types'

const preset = (options?: AttributifyOptions): Preset => {
  const variants = [
    variantAttributify(options),
  ]
  const extractors = [
    extractorAttributify(options),
  ]

  if (!options?.strict)
    extractors.unshift(extractorSplit)

  return {
    variants,
    extractors,
  }
}

export default preset
