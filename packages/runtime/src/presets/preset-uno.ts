import type { PresetUnoOptions } from '@unocss/preset-uno'
import presetUno from '@unocss/preset-uno'

(() => {
  window.__unocss_presets = Object.assign(window.__unocss_presets ?? {}, {
    presetUno: (options: PresetUnoOptions) => presetUno(options),
  })
})()
