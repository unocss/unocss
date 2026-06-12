import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    Vue(),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: {
        'index': 'src/index.ts',
        'codemirror/index': 'src/codemirror/index.ts',
        'monaco/index': 'src/monaco/index.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external(id) {
        if (['vue', 'monaco-editor', 'codemirror', 'splitpanes', 'magic-string'].includes(id))
          return true
        if (id.startsWith('prettier/'))
          return true
        if (id.startsWith('@codemirror/'))
          return true
        if (id.startsWith('@vueuse/'))
          return true
        // Externalize @unocss/* packages but NOT @unocss/repl/* (self-referencing)
        if (id.startsWith('@unocss/') && !id.startsWith('@unocss/repl'))
          return true
        return false
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
  },
})
