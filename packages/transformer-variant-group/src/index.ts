import type { SourceCodeTransformer } from '@unocss/core'
import { regexClassGroup } from '@unocss/core'
import type MagicString from 'magic-string-extra'

export default function transformerVariantGroup(): SourceCodeTransformer {
  return {
    name: 'variant-group',
    enforce: 'pre',
    async transform(code) {
      return transformVariantGroups(code)
    },
  }
}

export function transformVariantGroups(code: MagicString) {
  let match

  regexClassGroup.lastIndex = 0
  // eslint-disable-next-line no-cond-assign
  while ((match = regexClassGroup.exec(code.original))) {
    const start = match.index
    const end = start + match[0].length
    const [, pre, sep, body] = match
    const replacement = body.split(/\s/g).map(i => i.replace(/^(!?)(.*)/, `$1${pre}${sep}$2`)).join(' ')
    code.overwrite(start, end, replacement)
  }
}
