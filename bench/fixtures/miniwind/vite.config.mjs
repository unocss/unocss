import { defineConfig } from 'vite'
import Hummin from '@minwind/vite'

export default defineConfig({
  plugins: [
    Hummin({
      include: [/\.js$/],
    }),
  ],
})
