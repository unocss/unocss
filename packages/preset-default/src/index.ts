import { createMiniwindWithDefaults, extractorSplit, Preset } from '@miniwind/core'
import { defaultRules } from './rules'
import { defaultTheme } from './theme'
import { defaultVariants } from './variants'

export * from './rules'
export * from './variants'
export * from './theme'

export const presetDefault = (): Preset => ({
  rules: defaultRules,
  variants: defaultVariants,
  extractors: [extractorSplit],
})

export const {
  createGenerator,
  resolveConfig,
} = createMiniwindWithDefaults({
  theme: defaultTheme,
  presets: [
    presetDefault(),
  ],
})
