// This file is for testing

// eslint-disable-next-line no-restricted-imports
import { defineConfig, presetAttributify, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
  ],
})
