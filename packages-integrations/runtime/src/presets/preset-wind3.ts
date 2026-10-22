import type { PresetWind3Options } from '@unocss/preset-wind3'
import type { RuntimeContext } from '..'
import presetWind3 from '@unocss/preset-wind3'

window.__unocss_runtime = window.__unocss_runtime ?? {} as RuntimeContext
window.__unocss_runtime.presets = Object.assign(window.__unocss_runtime?.presets ?? {}, {
  presetWind3: (options: PresetWind3Options) => presetWind3(options),
})
