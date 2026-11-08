import process from 'node:process'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    UnoCSS(),
    {
      // Runtime themes are switched with attributes; build themes need none.
      name: 'runtime-theme-attributes',
      transformIndexHtml(html) {
        if (process.env.THEMES !== 'runtime')
          return html
        const client = process.env.CLIENT ?? 'acme'
        const scheme = process.env.SCHEME ?? 'day'
        return html.replace('<html lang="en">', `<html lang="en" data-client="${client}" data-scheme="${scheme}">`)
      },
    },
  ],
  build: {
    outDir: process.env.OUT_DIR ?? 'dist',
    emptyOutDir: true,
  },
})
