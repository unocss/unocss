import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import { alias } from '../../alias.ts'
import UnoCSS from '../../packages-presets/unocss/src/vite.ts'

export default defineConfig({
  resolve: { alias },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.VSCODE_TEXTMATE_DEBUG': 'false',
    // Every overlay chunk is served from /__unocss/overlay/. Resolve the
    // authenticated backend relative to it, including a custom Vite base.
    'import.meta.env.VITE_INSPECTOR_RPC_BASE': 'new URL("../", import.meta.url).href',
  },
  plugins: [
    UnoCSS({ configFile: 'uno.overlay.config.ts', inspector: false }),
    Vue(),
    AutoImport({ imports: ['vue'], dts: false }),
  ],
  build: {
    outDir: 'dist/client/overlay',
    emptyOutDir: true,
    lib: {
      entry: 'overlay/main.ts',
      formats: ['es'],
      fileName: () => 'index.js',
      cssFileName: 'style',
    },
    rollupOptions: {
      output: { chunkFileNames: '[name]-[hash].js' },
    },
  },
})
