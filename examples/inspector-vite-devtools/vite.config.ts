import { DevTools } from '@vitejs/devtools'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    // Vite DevTools in embedded mode — the UnoCSS inspector mounts as a
    // dock inside it
    DevTools({
      build: {
        // Also emit a static DevTools export (with a pre-computed RPC
        // dump of the inspector data) during `vite build`
        withApp: true,
      },
    }),
    UnoCSS(),
  ],
  build: {
    rolldownOptions: {
      // Enable devtools mode so `vite build` collects build-time data
      devtools: {},
    },
  },
})
