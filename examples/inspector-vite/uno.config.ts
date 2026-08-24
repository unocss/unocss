import presetAttributify from '@unocss/preset-attributify'
import presetIcons from '@unocss/preset-icons'
import presetWind3 from '@unocss/preset-wind3'
import { defineConfig } from 'unocss'

export default defineConfig({
  shortcuts: {
    'btn': 'px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 cursor-pointer',
    'text-title': 'text-2xl font-bold',
  },
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons(),
  ],
})
