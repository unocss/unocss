import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import UnoCSS from '@unocss/svelte-scoped-vite'

export default defineConfig({
  plugins: [
    // it's unnessary to use SvelteScopedUno here as we are using the preprocessor, but I'm adding it to conveniently provide a reset and preflights to my demo app - you can toggle this behavior by setting `onlyGlobal` to `true`
    UnoCSS({
      onlyGlobal: true,
      addReset: 'tailwind',
    }),
    sveltekit(),
  ],
})
