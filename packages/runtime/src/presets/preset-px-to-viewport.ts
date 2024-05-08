import type { PxToViewportOptions } from '@unocss/preset-px-to-viewport'
import presetPxToViewPort from '@unocss/preset-px-to-viewport'
import type { RuntimeContext } from '..'

window.__unocss_runtime = window.__unocss_runtime ?? {} as RuntimeContext
window.__unocss_runtime.presets = Object.assign(window.__unocss_runtime?.presets ?? {}, {
  presetPxToViewPort: (options: PxToViewportOptions) => presetPxToViewPort(options),
})
