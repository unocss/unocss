import { UserConfig } from '@unocss/core'

export type FilterPattern = ReadonlyArray<string | RegExp> | string | RegExp | null

export interface PluginOptions extends UserConfig {
  include?: FilterPattern
  exclude?: FilterPattern
}
