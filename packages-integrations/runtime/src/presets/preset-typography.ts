import type { TypographyOptions } from '@unocss/preset-typography'
import type { RuntimeContext } from '..'
import presetTypography from '@unocss/preset-typography'

window.__unocss_runtime = window.__unocss_runtime ?? {} as RuntimeContext
window.__unocss_runtime.presets = Object.assign(window.__unocss_runtime?.presets ?? {}, {
  presetTypography: (options: TypographyOptions) => presetTypography(options),
})
