import adapter from '@sveltejs/adapter-auto'
import preprocess from 'svelte-preprocess'
import UnoCSS from '@unocss/svelte-preprocess-unocss'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    preprocess(),
    UnoCSS({ options: { classPrefix: 'spu-' } }),
  ],

  kit: {
    adapter: adapter(),
  },
}

export default config
