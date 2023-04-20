import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import UnoCSS from '@unocss/vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      name: 'MyLib',
    },
    rollupOptions: {
      external: ['vue'],
      output: [
        {
          dir: resolve(__dirname, 'dist/es'),
          format: 'es',
          entryFileNames: 'index.mjs',
          assetFileNames: 'assets/mylib.css',
          preserveModules: true,
          preserveModulesRoot: resolve(__dirname, './'),
        },
        {
          dir: resolve(__dirname, 'dist/cjs'),
          format: 'cjs',
          entryFileNames: 'index.cjs',
          assetFileNames: 'assets/mylib.css',
          preserveModules: true,
          preserveModulesRoot: resolve(__dirname, './'),
        },
        {
          globals: {
            vue: 'Vue',
          },
          dir: resolve(__dirname, 'dist/umd'),
          format: 'umd',
          entryFileNames: 'index.js',
          name: 'MyLib',
        },
        {
          globals: {
            vue: 'Vue',
          },
          dir: resolve(__dirname, 'dist/iife'),
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
