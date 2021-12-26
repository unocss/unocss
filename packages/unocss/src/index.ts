import type { UserConfig } from '@unocss/core'

export * from '@unocss/core'
export { default as presetUno } from '@unocss/preset-uno'
export { default as presetAttributify } from '@unocss/preset-attributify'
export { default as presetIcons } from '@unocss/preset-icons'
export { default as presetGlyphs } from '@unocss/preset-glyphs'

export function defineConfig<Theme extends {}>(config: UserConfig<Theme>) {
  return config
}
