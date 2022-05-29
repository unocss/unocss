import type { VariantHandler, VariantObject } from '@unocss/core'
import type { TagifyOptions } from './types'
import { MARKER } from './extractor'

export const variantTagify = (options: TagifyOptions): VariantObject => {
  const prefix = `${MARKER}${options.prefix ?? ''}`

  return {
    name: 'tagify',
    match(input) {
      if (!input.startsWith(prefix))
        return

      const { extraProperties } = options

      const handler: VariantHandler = {
        matcher: input.slice(prefix.length),
        selector: i => i.slice(MARKER.length + 1),
      }

      if (extraProperties) {
        const matched = input.slice(prefix.length)
        if (typeof extraProperties === 'function')
          handler.body = entries => [...entries, ...Object.entries(extraProperties(matched) ?? {})]
        else
          handler.body = entries => [...entries, ...Object.entries(extraProperties)]
      }

      return handler
    },
  }
}
