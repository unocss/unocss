import type { SourceCodeTransformer } from '@unocss/core'
import { expandVariantGroup, extractQuoted } from '@unocss/core'

export default function transformerVariantGroup(): SourceCodeTransformer {
  return {
    name: 'variant-group',
    enforce: 'pre',
    transform(s) {
      extractQuoted(
        s.toString(),
        {
          details: true,
          templateStaticOnly: true,
          deep: true,
        },
      )
        .filter(({ value: { length } }) => length)
        .forEach(({ value, range }) => s.overwrite(...range, expandVariantGroup(value)))
    },
  }
}
