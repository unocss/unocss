import type { Variant, VariantHandler } from '@unocss/core'

const scopeMatcher = (name: string, template: string) => {
  const re = new RegExp(`^${name}-\\[(.+?)\\][:-]`)
  return (matcher: string): VariantHandler | undefined => {
    const match = matcher.match(re)
    if (match) {
      return {
        matcher: matcher.slice(match[0].length),
        selector: s => template.replace('&&-s', s).replace('&&-c', match[1]),
      }
    }
  }
}

export const variantScopes: Variant[] = [
  scopeMatcher('scope', '&&-s &&-c'),
  scopeMatcher('scope-all', '&&-s &&-c'),
  scopeMatcher('scope-children', '&&-s>&&-c'),
  scopeMatcher('scope-next', '&&-s+&&-c'),
  scopeMatcher('scope-sibling', '&&-s+&&-c'),
  scopeMatcher('scope-siblings', '&&-s~&&-c'),
  scopeMatcher('scope-group', '&&-c &&-s'),
  scopeMatcher('scope-parent', '&&-c>&&-s'),
  scopeMatcher('scope-previous', '&&-c+&&-s'),
  scopeMatcher('scope-peer', '&&-c~&&-s'),
]
