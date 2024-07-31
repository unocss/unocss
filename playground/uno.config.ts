import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  presetWebFonts,
  transformerCompileClass,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'

export default defineConfig({
  shortcuts: {
    'border-base': 'border-gray-500:10',
    'bg-base': 'bg-white dark:bg-hex-121212',
    'responsiveBorder': 'absolute flex items-center justify-center bg-light-700 dark:bg-dark-800 [&>span]-(w-4 h-4 text-gray-400)',
  },
  presets: [
    presetAttributify(),
    presetUno(),
    presetIcons(),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        mono: 'DM Mono',
      },
      processors: createLocalFontProcessor(),
    }),
  ],
  transformers: [
    transformerCompileClass(),
    transformerVariantGroup(),
    transformerDirectives(),
  ],
})
