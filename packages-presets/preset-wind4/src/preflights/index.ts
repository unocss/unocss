import type { Preflight } from '@unocss/core'
import type { PresetWind4Options } from '..'
import type { Theme } from '../theme/types'
import { property } from './property'
import { reset } from './reset'
import { theme } from './theme'

export const preflights: (options: PresetWind4Options) => Preflight<Theme>[] = (options) => {
  return [
    reset(options),
    theme(options),
    property(options),
  ].filter(Boolean) as Preflight<Theme>[]
}
