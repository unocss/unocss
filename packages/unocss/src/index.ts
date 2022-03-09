import type { UserConfig } from '@unocss/core'

export * from '@unocss/core'
export { default as presetUno } from '@unocss/preset-uno'
export { default as presetAttributify } from '@unocss/preset-attributify'
export { default as presetIcons } from '@unocss/preset-icons'
export { default as presetWebFonts } from '@unocss/preset-web-fonts'
export { default as presetTypography } from '@unocss/preset-typography'
export { default as presetMini } from '@unocss/preset-mini'
export { default as presetWind } from '@unocss/preset-wind'
export { default as transformerDirectives } from '@unocss/transformer-directives'
export { default as transformerVariantGroup } from '@unocss/transformer-variant-group'

export function defineConfig<Theme extends {}>(config: UserConfig<Theme>) {
  return config
}
