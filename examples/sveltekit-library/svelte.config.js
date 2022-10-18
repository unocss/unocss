import adapter from '@sveltejs/adapter-auto'
import preprocess from 'svelte-preprocess'
import UnoCSS from '@unocss/svelte-preprocess-unocss'

const mode = process.env.NODE_ENV
const prod = mode === 'production'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    preprocess(),
    UnoCSS({
      options: {
        classPrefix: 'spu-',
        combine: prod,
      },
    }),
  ],

  kit: {
    adapter: adapter(),
  },
}

export default config
