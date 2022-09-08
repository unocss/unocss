import type { Variant } from '@unocss/core'
import { getComponent, handler as h } from '../utils'

export const variantSelector = (): Variant => {
  let re: RegExp
  return {
    name: 'selector',
    match(matcher, ctx) {
      if (!re) {
        re = new RegExp(`^selector-\[(.+?)\]${ctx.generator.config.separator}`)
      }
      const match = matcher.match(re)
      if (match) {
        return {
          matcher: matcher.slice(match[0].length),
          selector: () => match[1],
        }
      }
    },
  }
}

export const variantCssLayer = (): Variant => {
  let re: RegExp
  return {
    name: 'layer',
    match(matcher, ctx) {
      if (!re) {
        re = new RegExp(`^layer-([_\d\w]+)${ctx.generator.config.separator}`)
      }
      const match = matcher.match(re)
      if (match) {
        return {
          matcher: matcher.slice(match[0].length),
          handle: (input, next) => next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}@layer ${match[1]}`,
          }),
        }
      }
    },
  }
}

export const variantInternalLayer = (): Variant => {
  let re: RegExp
  return {
    name: 'uno-layer',
    match(matcher, ctx) {
      if (!re) {
        re = new RegExp(`^uno-layer-([_\d\w]+)${ctx.generator.config.separator}`)
      }
      const match = matcher.match(re)
      if (match) {
        return {
          matcher: matcher.slice(match[0].length),
          layer: match[1],
        }
      }
    },
  }
}

export const variantScope = (): Variant => {
  let re: RegExp
  return {
    name: 'scope',
    match(matcher, ctx) {
      if (!re) {
        re = new RegExp(`^scope-([_\d\w]+)${ctx.generator.config.separator}`)
      }
      const match = matcher.match(re)
      if (match) {
        return {
          matcher: matcher.slice(match[0].length),
          selector: s => `.${match[1]} $$ ${s}`,
        }
      }
    },
  }
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
