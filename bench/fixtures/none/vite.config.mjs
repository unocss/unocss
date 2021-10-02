import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    Vue(),
  ],
})
