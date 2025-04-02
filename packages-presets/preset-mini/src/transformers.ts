import type { SourceCodeTransformer } from '@unocss/core'
import { cssUrlTransformer } from '@unocss/rule-utils'

export const bgColorsTransformer = cssUrlTransformer({
  name: '@unocss/preset-mini:transformer',
  enforce: 'pre',
  regexp: / ?bg-(\[.+\])/g,
})

export const transformers: SourceCodeTransformer[] = [
  bgColorsTransformer,
]
