import { createMiniwindWithDefaults } from '@miniwind/core'
import { defaultTheme, presetDefault } from '@miniwind/preset-default'

export const {
  createGenerator,
  resolveConfig,
} = createMiniwindWithDefaults({
  theme: defaultTheme,
  presets: [
    presetDefault(),
  ],
})
