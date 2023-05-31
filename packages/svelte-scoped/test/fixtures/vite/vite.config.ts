import { defineConfig } from 'vite'
import transformerDirectives from '@unocss/transformer-directives'
import { sveltekit } from '@sveltejs/kit/vite'
import UnoCSS from '@unocss/svelte-scoped/vite'

export default defineConfig({
  build: {
    minify: false,
  },
  clearScreen: false,
  plugins: [
    UnoCSS({
      cssFileTransformers: [transformerDirectives()],
    }),
    sveltekit(),
  ],
})
