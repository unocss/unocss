import { UserConfig } from '@unocss/core'

export * from '@unocss/core'
export { default as presetUno } from '@unocss/preset-uno'
export { default as presetAttributify } from '@unocss/preset-attributify'

export function defineConfig(config: UserConfig) {
  return config
}
