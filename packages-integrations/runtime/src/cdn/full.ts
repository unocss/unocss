import presetAttributify from '@unocss/preset-attributify'
import presetTagify from '@unocss/preset-tagify'
import presetTypography from '@unocss/preset-typography'
import presetUno from '@unocss/preset-uno'
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
