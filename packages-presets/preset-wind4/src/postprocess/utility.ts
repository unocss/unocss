import type { BaseContext, Postprocessor } from '@unocss/core'
import type { PresetWind4Options } from '..'
import { toArray } from '@unocss/core'

export function utility({ utilityResolver }: PresetWind4Options): Postprocessor[] {
  const processor: Postprocessor = (util) => {
    const resolvers = toArray(utilityResolver)
    util.entries.forEach((i) => {
      for (const resolver of resolvers) {
        resolver(i, 'default', {} as BaseContext)
      }
    })
  }

  return utilityResolver ? [processor] : []
}
