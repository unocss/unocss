import type { Preset } from '@unocss/core'
import { extractorSplit } from '@unocss/core'
import type { TagifyOptions } from './types'
import { extractorTagify } from './extractor'
import { variantTagify } from './variant'

export * from './extractor'
export * from './types'
export * from './variant'

function tagifyPreset(options: TagifyOptions = {}): Preset {
  const {
    defaultExtractor = true,
  } = options

  const variants = [
    variantTagify(options),
  ]
  const extractors = [
    extractorTagify(options),
  ]

  if (defaultExtractor)
    extractors.push(extractorSplit)

  return {
    name: '@unocss/preset-tagify',
    variants,
    extractors,
  }
}

export default tagifyPreset
