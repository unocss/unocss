import { resolve } from 'node:path'
import UnoCSS from '@unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'lib/main.ts'),
      name: 'MyLib',
    },
    rollupOptions: {
      external: ['vue'],
      output: [
        {
          dir: resolve(import.meta.dirname, 'dist/es'),
          format: 'es',
          entryFileNames: 'index.mjs',
          assetFileNames: 'assets/mylib.css',
          preserveModules: true,
          preserveModulesRoot: resolve(import.meta.dirname, './'),
        },
        {
          dir: resolve(import.meta.dirname, 'dist/cjs'),
          format: 'cjs',
          entryFileNames: 'index.cjs',
          assetFileNames: 'assets/mylib.css',
          preserveModules: true,
          preserveModulesRoot: resolve(import.meta.dirname, './'),
        },
        {
          globals: {
            vue: 'Vue',
          },
          dir: resolve(import.meta.dirname, 'dist/umd'),
          format: 'umd',
          entryFileNames: 'index.js',
          name: 'MyLib',
        },
        {
          globals: {
            vue: 'Vue',
          },
          dir: resolve(import.meta.dirname, 'dist/iife'),
          format: 'iife',
          entryFileNames: 'index.js',
          name: 'MyLib',
        },
      ],
    },
    sourcemap: true,
    cssCodeSplit: true,
  },
  plugins: [
    UnoCSS(),
  ],
})
