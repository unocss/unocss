import type { PresetWindOptions } from '@unocss/preset-wind'
import presetWind from '@unocss/preset-wind'

(() => {
  window.__unocss_presets = Object.assign(window.__unocss_presets ?? {}, {
    presetWind: (options: PresetWindOptions) => presetWind(options),
  })
})()
