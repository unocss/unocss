import { cssIdRE } from '@unocss/core'
import type { SourceCodeTransformer } from '@unocss/core'
import { transformDirectives } from './transform'
import type { TransformerDirectivesOptions } from './types'

export * from './types'

export default function transformerDirectives(options: TransformerDirectivesOptions = {}): SourceCodeTransformer {
  return {
    name: '@unocss/transformer-directives',
    enforce: options?.enforce,
    idFilter: id => cssIdRE.test(id),
    transform: (code, id, ctx) => {
      return transformDirectives(code, ctx.uno, options, id)
    },
  }
}
