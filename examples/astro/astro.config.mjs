import { defineConfig } from 'astro/config'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  vite: {
    plugins: [
      UnoCSS(),
    ],
  },
})
