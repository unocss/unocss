import vue from '@astrojs/vue'
import { defineConfig } from 'astro/config'
import UnoCSS from 'unocss/astro'

export default defineConfig({
  integrations: [
    vue(),
    UnoCSS({ injectReset: true }),
  ],
})
