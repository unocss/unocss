import { defineConfig } from 'vite'
import presetUno from '@unocss/preset-uno'
import presetAttributify from '@unocss/preset-attributify'
import Unocss from 'unocss/vite'

export default defineConfig({
  optimizeDeps: {
    exclude: [
      'vitepress',
    ],
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    Unocss({
      presets: [presetUno(), presetAttributify()],
    }),
  ],
})
