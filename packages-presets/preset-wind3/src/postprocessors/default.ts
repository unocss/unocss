import type { Postprocessor } from '@unocss/core'
import type { PresetWind3Options } from '..'
import { toArray } from '@unocss/core'
import presetMini from '@unocss/preset-mini'
import { important } from './important'

export function postprocessors(options: PresetWind3Options): Postprocessor[] {
  return [
    ...toArray(presetMini(options).postprocess),
    ...important(options.important),
  ]
}
