import presetAttributify from '@unocss/preset-attributify'
import type { Theme } from '@unocss/preset-uno'
import presetUno from '@unocss/preset-uno'
import presetTypography from '@unocss/preset-typography'
import presetTagify from '@unocss/preset-tagify'
import init from '../index'

init<Theme>({
  defaults: {
    presets: [
      presetAttributify(),
      presetUno(),
      presetTypography(),
      presetTagify(),
    ],
  },
})
