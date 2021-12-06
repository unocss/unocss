import { resolve } from 'path'
import { defineConfig, AliasOptions } from 'vite'

const r = (p: string) => resolve(__dirname, p)

export const alias: AliasOptions = {
  'unocss': r('./packages/unocss/src/'),
  '@unocss/core': r('./packages/core/src/'),
  '@unocss/vite': r('./packages/vite/src/'),
  '@unocss/cli': r('./packages/cli/src/'),
  '@unocss/inspector': r('./packages/inspector/node/'),
  '@unocss/preset-mini': r('./packages/preset-mini/src/'),
  '@unocss/preset-wind': r('./packages/preset-wind/src/'),
  '@unocss/preset-uno': r('./packages/preset-uno/src/'),
  '@unocss/preset-attributify': r('./packages/preset-attributify/src/'),
  '@unocss/preset-icons': r('./packages/preset-icons/src/'),
}

export default defineConfig({
  resolve: {
    alias,
  },
})
