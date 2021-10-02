import { defineConfig } from 'vite'
import Miniwind from '../../../dist/vite.mjs'

export default defineConfig({
  plugins: [
    Miniwind({
      include: [/\.js$/],
    }),
  ],
})
