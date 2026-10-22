import type { PresetWind4Options } from '@unocss/preset-wind4'
import type { RuntimeContext } from '..'
import presetWind4 from '@unocss/preset-wind4'

window.__unocss_runtime = window.__unocss_runtime ?? {} as RuntimeContext
window.__unocss_runtime.presets = Object.assign(window.__unocss_runtime?.presets ?? {}, {
  presetWind4: (options: PresetWind4Options) => presetWind4(options),
})
