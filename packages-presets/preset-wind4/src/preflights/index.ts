import type { Preflight } from '@unocss/core'
import type { PresetWind4Options } from '..'
import type { Theme } from '../theme/types'
import { theme } from './theme'

export const preflights: (options: PresetWind4Options) => Preflight<Theme>[] = (options) => {
  return [
    theme(options),
  ]
}
