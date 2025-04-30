import type { SourceCodeTransformer } from '@unocss/core'
import { cssUrlTransformer } from '@unocss/rule-utils'

export const bgColorsTransformer = cssUrlTransformer({
  name: '@unocss/preset-wind4:transformer',
})

export const transformers: SourceCodeTransformer[] = [
  bgColorsTransformer,
]
