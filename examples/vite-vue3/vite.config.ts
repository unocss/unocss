// import legacy from '@vitejs/plugin-legacy'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import UnoCSS from '../../packages-integrations/vite/src/index'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue(),
    UnoCSS({
      virtualModulePrefix: 'custom_vue3',
    }) as any,
    // legacy(),
  ],
})
