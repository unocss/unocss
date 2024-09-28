import type { UserConfig, UserConfigDefaults } from '@unocss/core'
import { unplugin } from './unplugin'

export interface WebpackPluginOptions<Theme extends object = object> extends UserConfig<Theme> {
  /**
   * Manually enable watch mode
   *
   * @default false
   */
  watch?: boolean
}

export default function WebpackPlugin<Theme extends object>(
  configOrPath?: WebpackPluginOptions<Theme> | string,
  defaults?: UserConfigDefaults,
) {
  return unplugin(configOrPath, defaults).webpack()
}
