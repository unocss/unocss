import type { UserConfigDefaults } from '@unocss/core'
import type { WebpackPluginOptions } from '.'
import { unplugin } from './unplugin'

export function UnoCSSRspackPlugin<Theme extends object>(
  configOrPath?: WebpackPluginOptions<Theme> | string,
  defaults?: UserConfigDefaults,
) {
  return unplugin(configOrPath, defaults).rspack()
}
