import { resolve } from 'path'
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
          dir: 'dist/es',
          format: 'es',
          entryFileNames: '[name].mjs',
          assetFileNames: 'assets/[name].css',
          preserveModules: true,
          preserveModulesRoot: resolve(__dirname, './'),
        },
        {
          dir: 'dist/cjs',
          format: 'cjs',
          entryFileNames: '[name].cjs',
          assetFileNames: 'assets/[name].css',
          preserveModules: true,
          preserveModulesRoot: resolve(__dirname, './'),
        },
        {
          globals: {
            vue: 'Vue',
          },
          dir: 'dist/umd',
          format: 'umd',
          entryFileNames: 'index.js',
          name: 'MyLib',
        },
        {
          globals: {
            vue: 'Vue',
          },
          dir: 'dist/iife',
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
