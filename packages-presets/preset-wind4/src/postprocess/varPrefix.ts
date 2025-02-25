import type { Postprocessor } from '@unocss/core'
import type { PresetWind4Options } from '..'

export function varPrefix(prefix: PresetWind4Options['variablePrefix']): Postprocessor[] {
  const processor: Postprocessor = (obj) => {
    obj.entries.forEach((i) => {
      i[0] = i[0].replace(/^--un-/, `--${prefix}`)
      if (typeof i[1] === 'string')
        i[1] = i[1].replace(/var\(--un-/g, `var(--${prefix}`)
    })
  }

  return prefix !== 'un-' ? [processor] : []
}
