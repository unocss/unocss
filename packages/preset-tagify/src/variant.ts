import type { VariantHandler, VariantObject } from '@unocss/core'
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
      const handler: VariantHandler = {
        matcher,
        selector: i => i.slice(MARKER.length + 1),
      }

      if (extraProperties) {
        if (typeof extraProperties === 'function')
          handler.body = entries => [...entries, ...Object.entries(extraProperties(matcher) ?? {})]
        else
          handler.body = entries => [...entries, ...Object.entries(extraProperties)]
      }

      return handler
    },
  }
}
