import type { Variant, VariantObject } from '@unocss/core'
import type { PresetMiniOptions, Theme } from '..'

const scopeMatcher = (strict: boolean, name: string, template: string, options: PresetMiniOptions): VariantObject => {
  const re = strict
    ? new RegExp(`^${name}(?:-\\[(.+?)\\])${options.separator}`)
    : new RegExp(`^${name}(?:-\\[(.+?)\\])?${options.separator}`)
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

export const variantCombinators = (options: PresetMiniOptions = {}): Variant<Theme>[] => {
  return [
    scopeMatcher(false, 'all', '&&-s &&-c', options),
    scopeMatcher(false, 'children', '&&-s>&&-c', options),
    scopeMatcher(false, 'next', '&&-s+&&-c', options),
    scopeMatcher(false, 'sibling', '&&-s+&&-c', options),
    scopeMatcher(false, 'siblings', '&&-s~&&-c', options),
    scopeMatcher(true, 'group', '&&-c &&-s', options),
    scopeMatcher(true, 'parent', '&&-c>&&-s', options),
    scopeMatcher(true, 'previous', '&&-c+&&-s', options),
    scopeMatcher(true, 'peer', '&&-c~&&-s', options),
  ]
}
