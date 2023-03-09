import type { PresetUnoOptions } from '@unocss/preset-uno'
import presetUno from '@unocss/preset-uno'

window.__unocss_runtime = window.__unocss_runtime ?? { presets: {} }
window.__unocss_runtime.presets = Object.assign(window.__unocss_runtime?.presets ?? {}, {
  presetUno: (options: PresetUnoOptions) => presetUno(options),
})
