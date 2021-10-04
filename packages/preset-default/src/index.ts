import { createUnocssWithDefaults, extractorSplit, Preset } from '@unocss/core'
import { defaultRules } from './rules'
import { defaultTheme } from './theme'
import { defaultVariants } from './variants'

export { defaultTheme, defaultColors } from './theme'

export const presetDefault = (): Preset => ({
  rules: defaultRules,
  variants: defaultVariants,
  extractors: [extractorSplit],
})

export const {
  createGenerator,
  resolveConfig,
} = createUnocssWithDefaults({
  theme: defaultTheme,
  presets: [
    presetDefault(),
  ],
})
