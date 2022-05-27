import type { Preset } from '@unocss/core'
import type { TagifyOptions } from './types'
import { extractorTagify } from './extractor'
import { variantTagify } from './variant'

export * from './extractor'
export * from './types'
export * from './variant'

export default (options?: TagifyOptions): Preset => ({
  name: '@unocss/preset-tagify',
  variants: [variantTagify(options)],
  extractors: [extractorTagify()],
})
