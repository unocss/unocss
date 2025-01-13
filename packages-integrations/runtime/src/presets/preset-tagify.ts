import type { TagifyOptions } from '@unocss/preset-tagify'
import type { RuntimeContext } from '..'
import presetTagify from '@unocss/preset-tagify'

window.__unocss_runtime = window.__unocss_runtime ?? {} as RuntimeContext
window.__unocss_runtime.presets = Object.assign(window.__unocss_runtime?.presets ?? {}, {
  presetTagify: (options: TagifyOptions) => presetTagify(options),
})
