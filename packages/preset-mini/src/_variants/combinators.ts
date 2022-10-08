import type { Variant, VariantHandler, VariantObject } from '@unocss/core'
import { getComponent, handler as h } from '../utils'

const scopeMatcher = (name: string, combinator: string): VariantObject => ({
  name: `combinator:${name}`,
  match: (matcher: string): VariantHandler | undefined => {
    if (!matcher.startsWith(name))
      return

    let newMatcher = matcher.substring(name.length + 1)
    const body = getComponent(newMatcher, '[', ']', [':', '-'])

    if (!body)
      return

    const [match, rest] = body
    let bracketValue = h.bracket(match) ?? ''

    if (bracketValue === '') {
      bracketValue = '*'
    }
    else {
      if (matcher[name.length] !== '-')
        return
      if (rest !== '')
        newMatcher = rest
    }

    return {
      matcher: newMatcher,
      selector: s => `${s}${combinator}${bracketValue}`,
    }
  },
  multiPass: true,
})

export const variantCombinators: Variant[] = [
  scopeMatcher('all', ' '),
  scopeMatcher('children', '>'),
  scopeMatcher('next', '+'),
  scopeMatcher('sibling', '+'),
  scopeMatcher('siblings', '~'),
]
