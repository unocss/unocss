import type { Variant, VariantObject } from '@unocss/core'

const scopeMatcher = (strict: boolean, name: string, template: string): VariantObject => {
  const re = strict
    ? new RegExp(`^${name}(?:-\\[(.+?)\\])[:-]`)
    : new RegExp(`^${name}(?:-\\[(.+?)\\])?[:-]`)
  return {
    name: `combinator:${name}`,
    match: (matcher: string) => {
      const match = matcher.match(re)
      if (match) {
        return {
          matcher: matcher.slice(match[0].length),
          selector: s => template.replace('&&-s', s).replace('&&-c', match[1] ?? '*'),
        }
      }
    },
    multiPass: true,
  }
}

export const variantCombinators: Variant[] = [
  scopeMatcher(false, 'all', '&&-s &&-c'),
  scopeMatcher(false, 'children', '&&-s>&&-c'),
  scopeMatcher(false, 'next', '&&-s+&&-c'),
  scopeMatcher(false, 'sibling', '&&-s+&&-c'),
  scopeMatcher(false, 'siblings', '&&-s~&&-c'),
  scopeMatcher(true, 'group', '&&-c &&-s'),
  scopeMatcher(true, 'parent', '&&-c>&&-s'),
  scopeMatcher(true, 'previous', '&&-c+&&-s'),
  scopeMatcher(true, 'peer', '&&-c~&&-s'),
]
