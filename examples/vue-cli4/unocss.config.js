import presetAttributify from '@unocss/preset-attributify'
import presetUno from '@unocss/preset-uno'
import { defineConfig } from '@unocss/config'

export default defineConfig({
  presets: [
    presetAttributify(),
    presetUno(),
  ],
})
