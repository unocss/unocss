import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Miniwind from '../../../dist/vite.mjs'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    Vue(),
    Miniwind(),
  ],
})
