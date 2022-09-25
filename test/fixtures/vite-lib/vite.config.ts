import { resolve } from 'pathe'
import { defineConfig } from 'vite'
import UnoCSS from '@unocss/vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      name: 'MyLib',
      fileName: 'my-lib',
      formats: [
        'cjs',
        'es',
        'iife',
        'umd',
      ],
    },
    cssCodeSplit: true,
  },
  plugins: [
    UnoCSS(),
  ],
})
