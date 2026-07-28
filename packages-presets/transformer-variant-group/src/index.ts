import type { SourceCodeTransformer } from '@unocss/core'
import { parseVariantGroup } from '@unocss/core'

export interface TransformerVariantGroupOptions {
  /**
   * Separators to expand.
   *
   * ```
   * foo-(bar baz) -> foo-bar foo-baz
   *    ^
   *    separator
   * ```
   *
   * You may set it to `[':']` for strictness.
   *
   * @default [':', '-']
   * @see https://github.com/unocss/unocss/pull/1231
   */
  separators?: (':' | '-')[]
}

export default function transformerVariantGroup(
  options: TransformerVariantGroupOptions = {},
): SourceCodeTransformer {
  const separators = options.separators || [':', '-']

  return {
    name: '@unocss/transformer-variant-group',
    enforce: 'pre',
    codeFilter: code => separators.some(separator => code.includes(`${separator}(`)),
    transform(s) {
      const result = parseVariantGroup(s, separators)
      return {
        get highlightAnnotations() {
          return [...result.groupsByOffset.values()].flatMap(group => group.items)
        },
      }
    },
  }
}
