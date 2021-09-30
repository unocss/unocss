import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Inspect from 'vite-plugin-inspect'
import Miniwind from '../src/vite'

export default defineConfig({
  plugins: [
    Vue(),
    Miniwind(),
    Inspect(),
  ],
})
