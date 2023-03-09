import type { TypographyOptions } from '@unocss/preset-typography'
import presetTypography from '@unocss/preset-typography'

window.__unocss_runtime = window.__unocss_runtime ?? { presets: {} }
window.__unocss_runtime.presets = Object.assign(window.__unocss_runtime?.presets ?? {}, {
  presetTypography: (options: TypographyOptions) => presetTypography(options),
})
