import type { Preflight } from '@unocss/core'
import type { PresetUnoNextOptions } from '..'
import type { Theme } from '../theme/types'
import { theme } from './theme'

export const preflights: (options: PresetUnoNextOptions) => Preflight<Theme>[] = (options) => {
  return [
    theme(options),
  ]
}
