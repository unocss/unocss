import type { Postprocessor } from '@unocss/core'
import type { PresetWind4Options } from '..'
import { important } from './important'
import { unit } from './unit'
import { varPrefix } from './varPrefix'

export function postprocessors(options: PresetWind4Options): Postprocessor[] {
  return [
    important,
    varPrefix,
    unit,
  ].flatMap(i => i(options))
}
