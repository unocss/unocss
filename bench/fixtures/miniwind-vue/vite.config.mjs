import { defineConfig } from 'vite'
import Miniwind from '../../../dist/vite-vue-sfc.mjs'

export default defineConfig({
  plugins: [
    Miniwind(),
  ],
})
