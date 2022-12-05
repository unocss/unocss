import { defineConfig } from 'astro/config'
import UnoCSS from 'unocss/astro'
import vue from '@astrojs/vue'

export default defineConfig({
  integrations: [
    vue(),
    UnoCSS(),
  ],
})
