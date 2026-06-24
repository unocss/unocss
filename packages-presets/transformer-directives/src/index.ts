import type { SourceCodeTransformer } from '@unocss/core'
import type { TransformerDirectivesOptions } from './types'
import { cssIdRE } from '@unocss/core'
import { resolveApplyVariables, transformDirectives } from './transform'

export * from './types'

export default function transformerDirectives(options: TransformerDirectivesOptions = {}): SourceCodeTransformer {
  const applyVariables = resolveApplyVariables(options)

  return {
    name: '@unocss/transformer-directives',
    enforce: options?.enforce,
    idFilter: id => cssIdRE.test(id),
    codeFilter: code =>
      code.includes('@apply')
      || code.includes('@screen')
      || code.includes('theme(')
      || code.includes('icon(')
      || applyVariables.some(variable => code.includes(variable)),
    transform: (code, id, ctx) => {
      return transformDirectives(code, ctx.uno, options, id)
    },
  }
}
