import { defineConfig } from 'vite'
import transformerDirectives from '@unocss/transformer-directives'
import { sveltekit } from '@sveltejs/kit/vite'
import UnoCSS from '@unocss/svelte-scoped/vite'
import presetUno from '@unocss/preset-uno'

export default defineConfig({
  build: {
    minify: false,
  },
  clearScreen: false,
  plugins: [
    UnoCSS({
      configOrPath: {
        presets: [
          presetUno(),
        ],
      },
      cssFileTransformers: [transformerDirectives()],
    }),
    sveltekit(),
  ],
})
