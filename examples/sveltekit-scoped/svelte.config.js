import { vitePreprocess } from '@sveltejs/kit/vite'
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
