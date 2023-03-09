import type { TypographyOptions } from '@unocss/preset-typography'
import presetTypography from '@unocss/preset-typography'

(() => {
  window.__unocss_presets = Object.assign(window.__unocss_presets ?? {}, {
    presetTypography: (options: TypographyOptions) => presetTypography(options),
  })
})()
