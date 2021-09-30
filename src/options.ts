import { NanowindUserConfig } from './types'
import { defaultConfig, NanowindConfig } from '.'

export function resolveConfig(config: NanowindUserConfig = {}): NanowindConfig {
  return Object.assign({}, defaultConfig, config)
}
