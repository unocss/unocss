import type { AttributifyOptions } from '@unocss/preset-attributify'
import presetAttributify from '@unocss/preset-attributify'

window.__unocss_presets = Object.assign(window.__unocss_presets ?? {}, {
  presetAttributify: (options: AttributifyOptions) => presetAttributify(options),
})
