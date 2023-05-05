import { defineConfig } from 'vite'
import UnoCSS from '@unocss/vite'
import Legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    UnoCSS(),
    Legacy(),
  ],
})
