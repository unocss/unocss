import presetAttributify from '@unocss/preset-attributify'
import presetUno from '@unocss/preset-uno'
import { presetTypography } from '@unocss/preset-typography'
import init from '../index'

init({
  defaults: {
    presets: [
      presetAttributify(),
      presetUno(),
      presetTypography(),
    ],
  },
})
