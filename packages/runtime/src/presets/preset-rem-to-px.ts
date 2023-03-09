import type { RemToPxOptions } from '@unocss/preset-rem-to-px'
import presetRemToPx from '@unocss/preset-rem-to-px'

window.__unocss_runtime = window.__unocss_runtime ?? { presets: {} }
window.__unocss_runtime.presets = Object.assign(window.__unocss_runtime?.presets ?? {}, {
  presetRemToPx: (options: RemToPxOptions) => presetRemToPx(options),
})
