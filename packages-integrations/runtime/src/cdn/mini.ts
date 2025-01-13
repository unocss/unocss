import presetAttributify from '@unocss/preset-attributify'
import presetMini from '@unocss/preset-mini'
import init from '../index'

init({
  defaults: {
    presets: [
      presetMini(),
      presetAttributify(),
    ],
  },
})
