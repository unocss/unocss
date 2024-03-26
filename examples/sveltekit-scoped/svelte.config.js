import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import adapter from '@sveltejs/adapter-auto'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
  },

  vitePlugin: {
    inspector: {
      showToggleButton: 'always',
    },
  },
}

export default config
