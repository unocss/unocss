import type { UserConfig, UserConfigDefaults } from '@unocss/core'

export interface UnoCSSRspackPluginOptions<Theme extends object = object> {
  configOrPath?: string | UserConfig<Theme>
  defaults?: UserConfigDefaults<Theme>
  root?: string
  include?: Array<string | RegExp>
  exclude?: Array<string | RegExp>
  watch?: boolean
  autoCssRule?: boolean
}

export type UnoCSSRsbuildPluginOptions<Theme extends object = object> = UnoCSSRspackPluginOptions<Theme>

export interface TransformResult {
  code: string
  map?: object
}
