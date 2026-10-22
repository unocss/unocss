import marko from '@marko/run/vite'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    marko(),
    UnoCSS(),
  ],
})
