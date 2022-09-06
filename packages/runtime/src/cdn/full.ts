import presetAttributify from '@unocss/preset-attributify'
import presetUno from '@unocss/preset-uno'
import presetTypography from '@unocss/preset-typography'
import presetTagify from '@unocss/preset-tagify'
import presetIcons from '@unocss/preset-icons'
import init from '../index'

init({
  defaults: {
    presets: [
      presetAttributify(),
      presetUno(),
      presetTypography(),
      presetTagify(),
      presetIcons({
        cdn: 'https://esm.sh/',
      }),
    ],
  },
})
