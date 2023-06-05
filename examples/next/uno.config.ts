// uno.config.ts
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  presetWind,
} from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetWind(), presetAttributify(), presetIcons()],
})
