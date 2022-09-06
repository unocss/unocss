import {
  defineConfig,
  presetIcons,
  presetUno,
  transformerDirectives,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    { 'i-logo': 'i-logos-astro w-6em h-6em transform transition-800' },
  ],
  transformers: [
    transformerDirectives(),
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
})
