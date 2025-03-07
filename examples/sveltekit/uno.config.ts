import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import extractorSvelte from '@unocss/extractor-svelte'
import presetIcons from '@unocss/preset-icons'
import presetWind3 from '@unocss/preset-wind3'
import { defineConfig } from 'unocss'

export default defineConfig({
  extractors: [
    extractorSvelte(),
  ],
  shortcuts: [
    { logo: 'i-logos:svelte-icon w-6em h-6em transform transition-800 hover:rotate-180' },
  ],
  presets: [
    presetWind3(),
    presetIcons({
      collections: {
        custom: {
          // do not remove LF: testing trimCustomSvg on universal icon loader
          circle: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
<circle cx="60" cy="60" r="50"/>
</svg>
`,
        },
        customfsl: FileSystemIconLoader(
          './icons',
          svg => svg.replace('<svg ', '<svg fill="currentColor" '),
        ),
      },
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
})
