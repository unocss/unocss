import { defineConfig } from 'vite'
import WindiCSS from 'vite-plugin-windicss'

export default defineConfig({
  plugins: [
    WindiCSS({
      scan: {
        include: ['../../source/*.js'],
      },
    }),
  ],
})
