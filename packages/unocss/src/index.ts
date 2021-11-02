import { UnocssPluginOptions } from '@unocss/vite'

export * from '@unocss/core'
export { default as presetUno } from '@unocss/preset-uno'
export { default as presetAttributify } from '@unocss/preset-attributify'
export { default as presetIcons } from '@unocss/preset-icons'

export function defineConfig(config: UnocssPluginOptions) {
  return config
}
