import { UserConfig } from '@unocss/core'

export type FilterPattern = ReadonlyArray<string | RegExp> | string | RegExp | null

export interface PluginOptions<Theme extends {} = {}> extends UserConfig<Theme> {
  include?: FilterPattern
  exclude?: FilterPattern
}
