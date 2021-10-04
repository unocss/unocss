import { UnoGenerator } from './generator'
import { resolveConfig as _resolveConfig } from './config'
import { RestArgs, UserConfig, UserConfigDefaults } from './types'

export function createUnocssWithDefaults(defaults: UserConfigDefaults) {
  return {
    resolveConfig(...args: RestArgs<typeof _resolveConfig>) {
      _resolveConfig(defaults, ...args)
    },
    createGenerator(config?: UserConfig) {
      return new UnoGenerator(defaults, config)
    },
  }
}
