import adapter from '@sveltejs/adapter-auto'
import preprocess from 'svelte-preprocess'
import UnoCSS from '@unocss/svelte-preprocess-unocss'
import presetUno from '@unocss/preset-uno'
import presetIcons from '@unocss/preset-icons'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    preprocess(),
    UnoCSS({
      presets: [
        presetUno(),
        presetIcons({
          prefix: 'i-',
          extraProperties: {
            'display': 'inline-block',
            'vertical-align': 'middle',
          },
        }),
      ],
      // more options,
    }),
  ],

  kit: {
    adapter: adapter(),
  },
}

export default config
