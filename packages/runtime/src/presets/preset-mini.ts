import type { PresetMiniOptions } from '@unocss/preset-mini'
import presetMini from '@unocss/preset-mini'

window.__unocss_presets = Object.assign(window.__unocss_presets ?? {}, {
  presetMini: (options: PresetMiniOptions) => presetMini(options),
})
