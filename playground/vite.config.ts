import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Inspect from 'vite-plugin-inspect'
import Nanowind from '../src/vite'

export default defineConfig({
  plugins: [
    Vue(),
    Nanowind(),
    Inspect(),
  ],
  build: {
    // minify: false,
  },
})
