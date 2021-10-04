import { createHumminWithDefaults } from '@hummin/core'
import { defaultTheme, presetDefault } from '@hummin/preset-default'

export const {
  createGenerator,
  resolveConfig,
} = createHumminWithDefaults({
  theme: defaultTheme,
  presets: [
    presetDefault(),
  ],
})
