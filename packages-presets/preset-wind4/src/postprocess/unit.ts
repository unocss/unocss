import type { Postprocessor } from '@unocss/core'
import type { PresetWind4Options } from '..'
import { toArray } from '@unocss/core'

export function unit({ unitResolver }: PresetWind4Options): Postprocessor[] {
  const processor: Postprocessor = (util) => {
    const resolvers = toArray(unitResolver)
    util.entries.forEach((i) => {
      for (const resolver of resolvers) {
        resolver(i, 'default')
      }
    })
  }

  return unitResolver ? [processor] : []
}
