import type { UserConfigDefaults } from '@unocss/core'
import type { RspackPluginInstance } from 'unplugin'
import type { WebpackPluginOptions } from '.'
import { unplugin } from './unplugin'

export function UnoCSSRspackPlugin<Theme extends object>(
  configOrPath?: WebpackPluginOptions<Theme> | string,
  defaults?: UserConfigDefaults,
): RspackPluginInstance {
  return unplugin(configOrPath, defaults).rspack()
}
