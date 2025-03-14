import type { Preflight } from '@unocss/core'
import type { PresetWind4Options } from '..'
import type { Theme } from '../theme/types'
import { reset } from './reset'
import { theme } from './theme'

export const preflights: (options: PresetWind4Options) => Preflight<Theme>[] = (options) => {
  return [
    theme(options),
    reset(options),
  ].filter(Boolean) as Preflight<Theme>[]
}
