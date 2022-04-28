import { resolve } from 'path'
import { defineConfig } from 'vite'

const r = (p: string) => resolve(__dirname, p)

export const alias: Record<string, string> = {
  'unocss': r('./packages/unocss/src/'),
  '@unocss/core': r('./packages/core/src/'),
  '@unocss/vite': r('./packages/vite/src/'),
  '@unocss/cli': r('./packages/cli/src/'),
  '@unocss/autocomplete': r('./packages/autocomplete/src'),
  '@unocss/inspector': r('./packages/inspector/node/'),
  '@unocss/preset-mini': r('./packages/preset-mini/src/'),
  '@unocss/preset-wind': r('./packages/preset-wind/src/'),
  '@unocss/preset-uno': r('./packages/preset-uno/src/'),
  '@unocss/preset-web-fonts': r('./packages/preset-web-fonts/src/'),
  '@unocss/preset-attributify': r('./packages/preset-attributify/src/'),
  '@unocss/preset-icons': r('./packages/preset-icons/src/'),
  '@unocss/preset-typography': r('./packages/preset-typography/src/'),
  '@unocss/transformer-directives': r('./packages/transformer-directives/src/'),
  '@unocss/transformer-variant-group': r('./packages/transformer-variant-group/src/'),
}

export default defineConfig({
  optimizeDeps: {
    entries: [],
  },
  resolve: {
    alias,
  },
  test: {
    isolate: false,
    setupFiles: ['./test/setup.ts'],
  },
})
