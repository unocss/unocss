import { resolve } from 'node:path'
import UnoCSS from '@unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    UnoCSS({ mode: 'dist-chunk' }),
  ],
  build: {
    rollupOptions: {
      input: {
        a: resolve(import.meta.dirname, 'a.html'),
        b: resolve(import.meta.dirname, 'b.html'),
      },
    },
  },
})
