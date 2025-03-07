import { presetForms } from '@julr/unocss-preset-forms'
import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind3,
} from 'unocss'
import { logo } from './src/shortcuts/logo'

export default defineConfig({
  shortcuts: [
    logo,
    { 'styled-input': 'rounded-md border-gray-300 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50' },
  ],
  presets: [
    presetWind3(),
    presetForms(),
    presetIcons({
      prefix: 'i-',
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        // these will extend the default theme
        // sans: 'Roboto',
        mono: ['Fira Code', 'Fira Mono:400,700'],
      },
    }),
  ],
  safelist: ['bg-orange-300', 'prose', 'styled-input'],
})
