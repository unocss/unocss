import { sveltekit } from '@sveltejs/kit/vite'
import UnoCSS from '@unocss/svelte-scoped/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    // it's unnessary to use UnoCSS here as we are using the preprocessor, but you can still use the Vite plugin to conveniently provide a reset and preflights to your demo app by setting `onlyGlobal` to `true`
    UnoCSS({
      onlyGlobal: true,
      injectReset: '@unocss/reset/tailwind.css',
    }),
    sveltekit(),
  ],
})
