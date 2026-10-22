import { sveltekit } from '@sveltejs/kit/vite'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    UnoCSS({
      // top-level await in the HMR code crashes WebKit builds without the fix
      // for https://bugs.webkit.org/show_bug.cgi?id=242740 (see #5007)
      hmrTopLevelAwait: false,
    }),
    sveltekit(),
  ],
})
