import type { SourceCodeTransformer } from '@unocss/core'
import { expandVariantGroup } from '@unocss/core'

export default function transformerVariantGroup(): SourceCodeTransformer {
  return {
    name: 'variant-group',
    enforce: 'pre',
    transform(s) {
      expandVariantGroup(s)
    },
  }
}
