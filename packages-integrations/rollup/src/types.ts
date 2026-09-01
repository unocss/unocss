import type { UserConfig } from '@unocss/core'
import type { Plugin } from 'rollup'

export interface RollupPluginConfig<Theme extends object = object> extends UserConfig<Theme> {
  /**
   * Disable the warning when no UnoCSS virtual CSS entry is imported.
   *
   * @default false
   */
  checkImport?: boolean
}

export type UnoCSSRollupPlugin = Plugin
