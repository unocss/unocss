import presetUno from '@unocss/preset-uno'
import presetAttributify from '@unocss/preset-attributify'
import { initUnocssRuntime } from './factory'

initUnocssRuntime({
  presets: [
    presetUno(),
    presetAttributify(),
  ],
})
