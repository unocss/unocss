import type { FilterPattern, UserConfig, UserConfigDefaults } from '@unocss/core'

export interface UnoCSSRspackPluginOptions<Theme extends object = object> {
  configOrPath?: string | UserConfig<Theme>
  defaults?: UserConfigDefaults
  root?: string
  include?: FilterPattern
  exclude?: FilterPattern
  watch?: boolean
  autoCssRule?: boolean
}

export type UnoCSSRsbuildPluginOptions<Theme extends object = object> = UnoCSSRspackPluginOptions<Theme>

export interface TransformResult {
  code: string
  map?: object
}
