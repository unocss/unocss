import presetMini from '@unocss/preset-mini'
import presetAttributify from '@unocss/preset-attributify'
import init from '../index'

init({
  defaults: {
    presets: [
      presetMini(),
      presetAttributify(),
    ],
  },
})
