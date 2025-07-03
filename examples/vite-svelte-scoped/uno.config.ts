import extractorSvelte from '@unocss/extractor-svelte'
import presetIcons from '@unocss/preset-icons'
import presetWind3 from '@unocss/preset-wind3'
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
    presetWind3(),
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
})
