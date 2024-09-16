import UnoCSS from '@unocss/vite'
import Legacy from '@vitejs/plugin-legacy'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    UnoCSS(),
    Legacy(),
  ],
  build: {
    // Don't inline SVG to test output
    assetsInlineLimit: 0,
  },
})
