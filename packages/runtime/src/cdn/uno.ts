import type { Theme } from '@unocss/preset-uno'
import presetUno from '@unocss/preset-uno'
import init from '../index'

init<Theme>({
  defaults: {
    presets: [
      presetUno(),
    ],
  },
})
