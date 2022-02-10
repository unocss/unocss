import presetAttributify from '@unocss/preset-attributify'
import presetMini from '@unocss/preset-mini'
import presetUno from '@unocss/preset-uno'
import presetWind from '@unocss/preset-wind'
import { presetTypography } from '@unocss/preset-typography'
import init from '../index'

init({
  availablePresets: {
    presetAttributify,
    presetMini,
    presetTypography,
    presetUno,
    presetWind,
  },
})
