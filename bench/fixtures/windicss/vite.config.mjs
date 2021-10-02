import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    Vue(),
    WindiCSS(),
  ],
})
