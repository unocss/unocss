import type { Variant } from '@unocss/core'
import { getBracket, handler as h, variantGetBracket, variantGetParameter } from '../utils'

export const variantSelector: Variant = {
  name: 'selector',
  match(matcher) {
    const variant = variantGetBracket('selector-', matcher, [':', '-'])
    if (variant) {
      const [match, rest] = variant
      const selector = h.bracket(match)
      if (selector) {
        return {
          matcher: rest,
          selector: () => selector,
        }
      }
    }
  },
}

export const variantCssLayer: Variant = {
  name: 'layer',
  match(matcher) {
    const variant = variantGetParameter('layer-', matcher, [':', '-'])
    if (variant) {
      const [match, rest] = variant
      const layer = h.bracket(match) ?? match
      if (layer) {
        return {
          matcher: rest,
          handle: (input, next) => next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}@layer ${layer}`,
          }),
        }
      }
    }
  },
}

export const variantInternalLayer: Variant = {
  name: 'uno-layer',
  match(matcher) {
    const variant = variantGetParameter('uno-layer-', matcher, [':', '-'])
    if (variant) {
      const [match, rest] = variant
      const layer = h.bracket(match) ?? match
      if (layer) {
        return {
          matcher: rest,
          layer,
        }
      }
    }
  },
}

export const variantScope: Variant = {
  name: 'scope',
  match(matcher) {
    const variant = variantGetBracket('scope-', matcher, [':', '-'])
    if (variant) {
      const [match, rest] = variant
      const scope = h.bracket(match)
      if (scope) {
        return {
          matcher: rest,
          selector: s => `${scope} $$ ${s}`,
        }
      }
    }
  },
}

export const variantVariables: Variant = {
  name: 'variables',
  match(matcher) {
    if (!matcher.startsWith('['))
      return

    const [match, rest] = getBracket(matcher, '[', ']') ?? []
    if (!(match && rest))
      return

    let newMatcher: string | undefined
    for (const separator of [':', '-']) {
      if (rest.startsWith(separator)) {
        newMatcher = rest.slice(separator.length)
        break
      }
    }

    if (newMatcher == null)
      return

    const variant = h.bracket(match) ?? ''
    const useParent = variant.startsWith('@')
    if (!(useParent || variant.includes('&')))
      return

    return {
      matcher: newMatcher,
      handle(input, next) {
        const updates = useParent
          ? {
              parent: `${input.parent ? `${input.parent} $$ ` : ''}${variant}`,
            }
          : {
              selector: variant.replace(/&/g, input.selector),
            }
        return next({
          ...input,
          ...updates,
        })
      },
    }
  },
  multiPass: true,
}
