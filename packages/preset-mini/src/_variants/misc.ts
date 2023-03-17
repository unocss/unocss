import type { Variant } from '@unocss/core'
import { handler as h, variantGetBracket, variantGetParameter } from '../utils'

export const variantSelector: Variant = {
  name: 'selector',
  match(matcher, ctx) {
    const variant = variantGetBracket('selector-', matcher, ctx.generator.config.separators)
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
  match(matcher, ctx) {
    const variant = variantGetParameter('layer-', matcher, ctx.generator.config.separators)
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
  match(matcher, ctx) {
    const variant = variantGetParameter('uno-layer-', matcher, ctx.generator.config.separators)
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
  match(matcher, ctx) {
    const variant = variantGetBracket('scope-', matcher, ctx.generator.config.separators)
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
