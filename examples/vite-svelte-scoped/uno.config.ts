import extractorSvelte from '@unocss/extractor-svelte'
import presetIcons from '@unocss/preset-icons'
import presetWind4 from '@unocss/preset-wind4'
import { defineConfig } from 'unocss'

export default defineConfig({
  extractors: [
    extractorSvelte(),
  ],
  shortcuts: [
    { logo: 'i-logos-svelte-icon w-6em h-6em transform transition-800 hover:rotate-180' },
    { foo: 'bg-yellow-400' },
    { bar: 'bg-green-400' },
  ],
  presets: [
    presetWind4({
      preflights: { reset: false },
    }),
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
})
