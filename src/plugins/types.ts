import { FilterPattern } from '@rollup/pluginutils'
import { createGenerator } from '../generator'
import { MiniwindConfig, MiniwindUserConfig } from '../types'

export interface MiniwindUserOptions extends MiniwindUserConfig {
  include?: FilterPattern
  exclude?: FilterPattern
  scope?: 'global' | 'module' | 'vue-scoped'
}

export interface ResolvedPluginContext {
  options: MiniwindUserOptions
  config: MiniwindConfig
  generate: ReturnType<typeof createGenerator>
}
