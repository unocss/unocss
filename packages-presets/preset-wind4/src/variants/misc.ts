import type { Variant, VariantFunction } from '@unocss/core'
import type { Theme } from '../theme'
import { getBracket, h, hasThemeFn, transformThemeFn, variantGetBracket, variantGetParameter, variantMatcher } from '../utils'

export const variantSelector: Variant<Theme> = {
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

export const variantCssLayer: Variant<Theme> = {
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

export const variantInternalLayer: Variant<Theme> = {
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

export const variantScope: Variant<Theme> = {
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

export const variantVariables: Variant<Theme> = {
  name: 'variables',
  match(matcher, ctx) {
    if (!matcher.startsWith('['))
      return

    const [match, rest] = getBracket(matcher, '[', ']') ?? []
    if (!(match && rest))
      return

    let newMatcher: string | undefined
    for (const separator of ctx.generator.config.separators) {
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

export const variantTheme: Variant<Theme> = {
  name: 'theme-variables',
  match(matcher, ctx) {
    if (!hasThemeFn(matcher))
      return

    return {
      matcher,
      handle(input, next) {
        return next({
          ...input,
          //  entries: [ [ '--css-spacing', '28px' ] ],
          entries: JSON.parse(transformThemeFn(JSON.stringify(input.entries), ctx.theme)),
        })
      },
    }
  },
}

export const variantSpaceAndDivide: VariantFunction<Theme> = (matcher) => {
  // test/svelte-scoped.test.ts:350:55
  if (matcher.startsWith('_'))
    return

  if (/space-[xy]-.+$/.test(matcher) || /divide-/.test(matcher)) {
    return {
      matcher,
      selector: (input) => {
        const not = '>:not(:last-child)'
        return input.includes(not) ? input : `${input}${not}`
      },
    }
  }
}

export const variantStickyHover: Variant<Theme>[] = [
  variantMatcher('@hover', input => ({
    parent: `${input.parent ? `${input.parent} $$ ` : ''}@media (hover: hover) and (pointer: fine)`,
    selector: `${input.selector || ''}:hover`,
  })),
]
