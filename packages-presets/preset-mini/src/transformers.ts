import type { SourceCodeTransformer } from '@unocss/core'
import { cssUrlTransformer } from '@unocss/rule-utils'

export const bgColorsTransformer = cssUrlTransformer({
  name: '@unocss/preset-mini:transformer',
})

export const transformers: SourceCodeTransformer[] = [
  bgColorsTransformer,
]
