import { toArray } from '@unocss/core'
import type { Postprocessor } from '@unocss/core'
import presetMini from '@unocss/preset-mini'
import type { PresetWindOptions } from '..'
import { important } from './important'

export function postprocessors(options: PresetWindOptions): Postprocessor[] {
  return [
    ...toArray(presetMini(options).postprocess),
    ...important(options.important),
  ]
}
