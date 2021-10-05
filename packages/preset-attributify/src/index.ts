import { Preset } from '@unocss/core'
import { extractorAttributify } from './extractor'
import { AttributifyOptions } from './types'
import { variantAttributify } from './variant'

export * from './extractor'
export * from './variant'
export * from './types'

const preset = (options?: AttributifyOptions): Preset => ({
  variants: [
    variantAttributify(options),
  ],
  extractors: [
    extractorAttributify(options),
  ],
})

export default preset
