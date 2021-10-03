import { defineConfig } from 'vite'
import Miniwind from '@minwind/vite'

export default defineConfig({
  plugins: [
    Miniwind({
      include: [/\.js$/],
    }),
  ],
})
