import { Preset } from '@miniwind/core'
import { extractorAttributify } from './extractor'
import { AttributifyOptions } from './types'
import { variantAttributify } from './variant'

export * from './extractor'
export * from './variant'
export * from './types'

export const presetAttributify = (options?: AttributifyOptions): Preset => ({
  variants: [
    variantAttributify(options),
  ],
  extractors: [
    extractorAttributify,
  ],
})
