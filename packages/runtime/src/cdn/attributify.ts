import presetUno from '@unocss/preset-uno'
import presetAttributify from '@unocss/preset-attributify'
import init from '../index'

init({
  defaults: {
    presets: [
      presetUno(),
      presetAttributify(),
    ],
  },
})
