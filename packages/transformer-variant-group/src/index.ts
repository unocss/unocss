import type { SourceCodeTransformer } from '@unocss/core'
import { regexClassGroup } from '@unocss/core'
import MagicString from 'magic-string'

export default function transformerVariantGroup(): SourceCodeTransformer {
  return {
    name: 'variant-group',
    enforce: 'pre',
    async transform(code) {
      return transformVariantGroups(code)
    },
  }
}

export function transformVariantGroups(code: string, sourcemap = true) {
  const s = new MagicString(code)
  let hasReplaced = false
  let match

  regexClassGroup.lastIndex = 0
  // eslint-disable-next-line no-cond-assign
  while ((match = regexClassGroup.exec(code))) {
    hasReplaced = true
    const start = match.index
    const end = start + match[0].length
    const [, pre, sep, body] = match
    const replacement = body.split(/\s/g).map(i => i.replace(/^(!?)(.*)/, `$1${pre}${sep}$2`)).join(' ')
    s.overwrite(start, end, replacement)
  }

  if (!hasReplaced)
    return null

  return {
    code: s.toString(),
    map: sourcemap
      ? s.generateMap({ hires: true })
      : undefined,
  }
}
