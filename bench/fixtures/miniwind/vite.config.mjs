import { defineConfig } from 'vite'
import Miniwind from '../../../dist/vite.mjs'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    Miniwind(),
  ],
})
