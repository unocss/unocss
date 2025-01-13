import type { PresetWindOptions } from '@unocss/preset-wind'
import type { RuntimeContext } from '..'
import presetWind from '@unocss/preset-wind'

window.__unocss_runtime = window.__unocss_runtime ?? {} as RuntimeContext
window.__unocss_runtime.presets = Object.assign(window.__unocss_runtime?.presets ?? {}, {
  presetWind: (options: PresetWindOptions) => presetWind(options),
})
