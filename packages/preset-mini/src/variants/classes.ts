import type { Variant, VariantHandler } from '@unocss/core'
import { escapeRegExp } from '@unocss/core'
import { handler as h } from '../utils'

const classMatcher = (name: string, template: string) => {
  const re = new RegExp(`^${escapeRegExp(name)}-(\\[.+?\\])[:-]`)
  return (matcher: string): VariantHandler | undefined => {
    const match = matcher.match(re)
    if (match) {
      const className = `.${h.bracket(match[1])}`
      return {
        matcher: matcher.slice(match[0].length),
        selector: s => template.replace('&&-s', s).replace('&&-c', className),
      }
    }
  }
}

export const variantClasses: Variant[] = [
  classMatcher('class', '&&-s &&-c'),
  classMatcher('class-all', '&&-s &&-c'),
  classMatcher('class-children', '&&-s>&&-c'),
  classMatcher('class-next', '&&-s+&&-c'),
  classMatcher('class-sibling', '&&-s+&&-c'),
  classMatcher('class-siblings', '&&-s~&&-c'),
  classMatcher('class-group', '&&-c &&-s'),
  classMatcher('class-parent', '&&-c>&&-s'),
  classMatcher('class-previous', '&&-c+&&-s'),
  classMatcher('class-peer', '&&-c~&&-s'),
]
