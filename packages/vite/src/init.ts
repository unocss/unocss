import { createUnocssWithDefaults } from '@unocss/core'
import { defaultTheme, presetDefault } from '@unocss/preset-default'

export const {
  createGenerator,
  resolveConfig,
} = createUnocssWithDefaults({
  theme: defaultTheme,
  presets: [
    presetDefault(),
  ],
})
