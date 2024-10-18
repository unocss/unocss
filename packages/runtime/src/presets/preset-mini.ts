import type { PresetMiniOptions } from '@unocss/preset-mini'
import type { RuntimeContext } from '..'
import presetMini from '@unocss/preset-mini'

window.__unocss_runtime = window.__unocss_runtime ?? {} as RuntimeContext
window.__unocss_runtime.presets = Object.assign(window.__unocss_runtime?.presets ?? {}, {
  presetMini: (options: PresetMiniOptions) => presetMini(options),
})
