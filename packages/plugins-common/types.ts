import { UserConfig } from '@unocss/core'

export type FilterPattern = ReadonlyArray<string | RegExp> | string | RegExp | null

export interface PluginConfig<Theme extends {} = {}> extends UserConfig<Theme> {
  /**
   * Patterns that filter the files being extracted.
   */
  include?: FilterPattern
  /**
   * Patterns that filter the files NOT being extracted.
   */
  exclude?: FilterPattern
}
