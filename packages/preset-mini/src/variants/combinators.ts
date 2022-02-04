import type { Variant, VariantHandler } from '@unocss/core'
import { variantMatcher } from '../utils'

const scopeMatcher = (name: string, template: string) => {
  const re = new RegExp(`^${name}(?:-\\[(.+?)\\])?[:-]`)
  return (matcher: string): VariantHandler | undefined => {
    const match = matcher.match(re)
    if (match) {
      return {
        matcher: matcher.slice(match[0].length),
        selector: s => template.replace('&&-s', s).replace('&&-c', match[1] ?? '*'),
      }
    }
  }
}

export const variantCombinators: Variant[] = [
  scopeMatcher('all', '&&-s &&-c'),
  scopeMatcher('children', '&&-s>&&-c'),
  scopeMatcher('next', '&&-s+&&-c'),
  scopeMatcher('sibling', '&&-s+&&-c'),
  scopeMatcher('siblings', '&&-s~&&-c'),
  variantMatcher('svg', input => `${input} svg`),
]
