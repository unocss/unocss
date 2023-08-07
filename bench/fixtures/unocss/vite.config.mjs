import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    UnoCSS({
      mergeSelectors: false,
      content: {
        pipeline: {
          include: [/\.js$/],
        },
      },
    }),
  ],
})
