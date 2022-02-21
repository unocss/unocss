import type { UserConfig } from '@unocss/core'

export * from '@unocss/core'
export { default as presetUno } from '@unocss/preset-uno'
export { default as presetAttributify } from '@unocss/preset-attributify'
export { default as presetIcons } from '@unocss/preset-icons'
export { default as presetWebFonts } from '@unocss/preset-web-fonts'
export { default as presetTypography } from '@unocss/preset-typography'
export { default as presetMini } from '@unocss/preset-mini'
export { default as transformerDirectives } from '@unocss/transformer-directives'

export function defineConfig<Theme extends {}>(config: UserConfig<Theme>) {
  return config
}
