import { createGenerator as _createGenerator } from './generator'
import { resolveConfig as _resolveConfig } from './config'
import { UserConfigDefaults } from './types'

export * from './types'
export * from './utils'
export * from './extractors'

export type ArgumentType<T> = T extends ((...args: infer A) => any) ? A : never
export type Shift<T> = T extends [_: any, ...args: infer A] ? A : never
export type RestArgs<T> = Shift<ArgumentType<T>>

export function createMiniwindWithDefaults(defaults: UserConfigDefaults) {
  return {
    createGenerator: (...args: RestArgs<typeof _createGenerator>) => _createGenerator(defaults, ...args),
    resolveConfig: (...args: RestArgs<typeof _resolveConfig>) => _resolveConfig(defaults, ...args),
  }
}
