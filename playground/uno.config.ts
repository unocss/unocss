import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  transformerCompileClass,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import presetWebFonts from '../packages/preset-web-fonts/src/'

export default defineConfig({
  theme: {
    fontFamily: {
      sans: '\'Lato\', sans-serif',
      mono: '\'Fira Code\', monospace',
    },
  },
  shortcuts: {
    responsiveBorder: 'absolute flex items-center justify-center bg-light-700 dark:bg-dark-800 [&>span]-(w-4 h-4 text-gray-400)',
  },
  presets: [
    presetAttributify(),
    presetUno(),
    presetIcons(),
    presetWebFonts({
      downloadLocally: true,
      provider: 'google',
      fonts: {
        sans: 'Lato',
        serif: 'Merriweather',
      },
    }),
  ],
  transformers: [
    transformerCompileClass(),
    transformerVariantGroup(),
    transformerDirectives(),
  ],
})
