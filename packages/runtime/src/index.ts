import presetUno from '@unocss/preset-uno'
import { initUnocssRuntime } from './factory'

initUnocssRuntime({
  presets: [
    presetUno(),
  ],
})
