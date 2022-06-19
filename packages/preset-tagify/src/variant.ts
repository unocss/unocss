import type { VariantObject } from '@unocss/core'
import type { TagifyOptions } from './types'
import { MARKER } from './extractor'

export const variantTagify = (options: TagifyOptions): VariantObject => {
  const { extraProperties } = options
  const prefix = `${MARKER}${options.prefix ?? ''}`

  return {
    name: 'tagify',
    match(input) {
      if (!input.startsWith(prefix))
        return

      const matcher = input.slice(prefix.length)

      return {
        matcher,
        handler: (input, next) => {
          if (extraProperties) {
            if (typeof extraProperties === 'function')
              input.entries.push(...Object.entries(extraProperties(matcher) ?? {}))
            else
              input.entries.push(...Object.entries(extraProperties))
          }

          return next({
            ...input,
            selector: input.selector.slice(MARKER.length + 1),
          })
        },
      }
    },
  }
}
