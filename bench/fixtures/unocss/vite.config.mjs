import { defineConfig } from 'vite'
import Unocss from '@minwind/vite'

export default defineConfig({
  plugins: [
    Unocss({
      include: [/\.js$/],
    }),
  ],
})
