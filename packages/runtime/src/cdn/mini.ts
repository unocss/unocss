import type { Theme } from '@unocss/preset-mini'
import presetMini from '@unocss/preset-mini'
import presetAttributify from '@unocss/preset-attributify'
import init from '../index'

init<Theme>({
  defaults: {
    presets: [
      presetMini(),
      presetAttributify(),
    ],
  },
})
