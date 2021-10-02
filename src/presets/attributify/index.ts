import { NanowindPreset } from '../../types'
import { extractorAttributify } from './extractor'
import { variantAttributify } from './variant'

export * from './extractor'
export * from './variant'

export const presetAttributify: NanowindPreset = {
  variants: [
    variantAttributify,
  ],
  extractors: [
    extractorAttributify,
  ],
}
