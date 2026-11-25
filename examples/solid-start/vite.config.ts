import { solidStart } from '@solidjs/start/config'
import presetWind4 from '@unocss/preset-wind4'
import UnoCSS from '@unocss/vite'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    UnoCSS({
      presets: [presetWind4()],
    }),
    solidStart(),
    nitro(),
  ],
})
