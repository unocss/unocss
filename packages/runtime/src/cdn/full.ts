import presetAttributify from '@unocss/preset-attributify'
import presetUno from '@unocss/preset-uno'
import presetTypography from '@unocss/preset-typography'
import presetTagify from '@unocss/preset-tagify'
import init from '../index'

init({
  defaults: {
    presets: [
      presetAttributify(),
      presetUno(),
      presetTypography(),
      presetTagify(),
    ],
  },
})
