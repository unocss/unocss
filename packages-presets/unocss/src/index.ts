import type { UserConfig } from '@unocss/core'
import type { Theme } from '@unocss/preset-uno'

export * from '@unocss/core'
export { type AttributifyOptions, default as presetAttributify } from '@unocss/preset-attributify'
export { type IconsOptions, default as presetIcons } from '@unocss/preset-icons'
export { default as presetMini, type PresetMiniOptions, type Theme as PresetMiniTheme } from '@unocss/preset-mini'
export { default as presetTagify, type TagifyOptions } from '@unocss/preset-tagify'
export { default as presetTypography, type TypographyOptions } from '@unocss/preset-typography'
export { default as presetUno, type PresetUnoOptions, type Theme as PresetUnoTheme } from '@unocss/preset-uno'
export { default as presetWebFonts, type WebFontsOptions } from '@unocss/preset-web-fonts'
export { default as presetWind, type PresetWindOptions, type Theme as PresetWindTheme } from '@unocss/preset-wind'
export { default as presetWind3, type PresetWind3Options, type Theme as PresetWind3Theme } from '@unocss/preset-wind3'
export { default as presetWind4, type PresetWind4Options, type Theme as PresetWind4Theme } from '@unocss/preset-wind4'
export { default as transformerAttributifyJsx } from '@unocss/transformer-attributify-jsx'
export { default as transformerCompileClass } from '@unocss/transformer-compile-class'
export { default as transformerDirectives } from '@unocss/transformer-directives'
export { default as transformerVariantGroup } from '@unocss/transformer-variant-group'

/**
 * Define UnoCSS config
 */
export function defineConfig<T extends object = Theme>(config: UserConfig<T>) {
  return config
}
