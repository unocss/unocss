import type { Postprocessor } from '@unocss/core'
import type { PresetWind4Options } from '..'
import { important } from './important'
import { utility } from './utility'
import { varPrefix } from './varPrefix'

export function postprocessors(options: PresetWind4Options): Postprocessor[] {
  return [
    important,
    varPrefix,
    utility,
  ].flatMap(i => i(options))
}
