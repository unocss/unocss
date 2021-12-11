import adapter from '@sveltejs/adapter-static'
import preprocess from 'svelte-preprocess'
import UnoCss from 'unocss/vite'
import { extractorSvelte } from '@unocss/core'
import presetIcons from '@unocss/preset-icons'
import presetUno from '@unocss/preset-uno'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),

  kit: {
    adapter: adapter(),

    // hydrate the <div id="svelte"> element in src/app.html
    target: '#svelte',
    vite: {
      plugins: [
        UnoCss({
          extractors: [extractorSvelte],
          shortcuts: [
            { logo: 'i-logos-svelte-icon w-6em h-6em transform transition-800 hover:rotate-180' },
            { foo: 'bg-yellow-400' },
            { bar: 'bg-green-400' },
          ],
          presets: [
            presetUno(),
            presetIcons({
              extraProperties: {
                'display': 'inline-block',
                'vertical-align': 'middle',
              },
            }),
          ],
        }),
      ],
    },
  },
}

export default config
