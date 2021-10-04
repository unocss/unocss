import { createGenerator as _createGenerator } from './generator'
import { resolveConfig as _resolveConfig } from './config'
import { RestArgs, UserConfigDefaults } from './types'

export function createHumminWithDefaults(defaults: UserConfigDefaults) {
  return {
    createGenerator: (...args: RestArgs<typeof _createGenerator>) => _createGenerator(defaults, ...args),
    resolveConfig: (...args: RestArgs<typeof _resolveConfig>) => _resolveConfig(defaults, ...args),
  }
}
