import type { TagifyOptions } from '@unocss/preset-tagify'
import presetTagify from '@unocss/preset-tagify'

window.__unocss_presets = Object.assign(window.__unocss_presets ?? {}, {
  presetTagify: (options: TagifyOptions) => presetTagify(options),
})
