import type { Postprocessor } from '@unocss/core'
import type { PresetWindOptions } from '..'
import { important } from './important'

export function postprocessors(options: PresetWindOptions): Postprocessor[] {
  return [
    ...important(options.important),
  ]
}
