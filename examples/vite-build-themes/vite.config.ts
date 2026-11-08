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
        const edition = process.env.EDITION ?? 'standard'
        return html.replace('<html lang="en">', `<html lang="en" data-client="${client}" data-edition="${edition}">`)
      },
    },
  ],
  build: {
    outDir: process.env.OUT_DIR ?? 'dist',
    emptyOutDir: true,
  },
})
