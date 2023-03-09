import type { AttributifyOptions } from '@unocss/preset-attributify'
import presetAttributify from '@unocss/preset-attributify'

window.__unocss_runtime = window.__unocss_runtime ?? { presets: {} }
window.__unocss_runtime.presets = Object.assign(window.__unocss_runtime?.presets ?? {}, {
  presetAttributify: (options: AttributifyOptions) => presetAttributify(options),
})
