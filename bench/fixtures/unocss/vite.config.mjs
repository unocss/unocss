import { defineConfig } from 'vite'
import Unocss from '@unocss/vite'

export default defineConfig({
  plugins: [
    Unocss({
      mergeSelectors: true,
      include: [/\.js$/],
    }),
  ],
})
