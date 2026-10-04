import { defineConfig } from 'astro/config'
import UnoCSS from '@unocss/astro'

export default defineConfig({
  integrations: [
    UnoCSS({
      injectEntry: false,
      injectReset: true,
      mode: 'dist-chunk',
    }),
  ],
  build: {
    format: 'file',
  },
})
