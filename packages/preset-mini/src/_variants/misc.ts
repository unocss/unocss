import type { Variant } from '@unocss/core'
import { getComponent, handler as h, variantGetComponent } from '../utils'

export const variantSelector: Variant = {
  name: 'selector',
  match(matcher) {
    const variant = variantGetComponent('selector', matcher)
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
    const variant = variantGetComponent('layer', matcher)
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
    const variant = variantGetComponent('uno-layer', matcher)
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
    const variant = variantGetComponent('scope', matcher)
    if (variant) {
      const [match, rest] = variant
      const scope = h.bracket(match)
      if (scope) {
        return {
          matcher: rest,
          selector: s => `.${scope} $$ ${s}`,
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

    const [match, rest] = getComponent(matcher, '[', ']', ':') ?? []
    if (!(match && rest && rest !== ''))
      return

    const variant = h.bracket(match) ?? ''
    if (!(variant.startsWith('@') || variant.includes('&')))
      return

    return {
      matcher: rest,
      handle(input, next) {
        const updates = variant.startsWith('@')
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
