import {
  defineConfig,
  presetIcons,
  presetUno,
  presetWebFonts,
  transformerDirectives,
} from 'unocss'

export default defineConfig({
  theme: {
    fontFamily: {
      sans: 'sans-serif',
    },
  },
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
    presetWebFonts({
      downloadLocally: true,
      provider: 'google',
      fonts: {
        sans: 'Lato',
        serif: 'Merriweather',
      },
    }),
  ],
})
