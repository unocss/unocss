import type { Variant } from '@unocss/core'
import type { PresetMiniOptions, Theme } from '..'
import { getComponent, handler as h } from '../utils'

export const variantSelector = (options: PresetMiniOptions = {}): Variant => {
  const selectorRE = new RegExp(`^selector-\[(.+?)\]${options.separator}`)
  return {
    name: 'selector',
    match(matcher, ctx) {
      const match = matcher.match(selectorRE)
      if (match) {
        return {
          matcher: matcher.slice(match[0].length),
          selector: () => match[1],
        }
      }
    },
  }
}

export const variantCssLayer = (options: PresetMiniOptions = {}): Variant => {
  const layerRE = new RegExp(`^layer-([_\d\w]+)${options.separator}`)
  return {
    name: 'layer',
    match(matcher) {
      const match = matcher.match(layerRE)
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

export const variantInternalLayer = (options: PresetMiniOptions = {}): Variant => {
  const internalRE = new RegExp(`^uno-layer-([_\d\w]+)${options.separator}`)
  return {
    name: 'uno-layer',
    match(matcher) {
      const match = matcher.match(internalRE)
      if (match) {
        return {
          matcher: matcher.slice(match[0].length),
          layer: match[1],
        }
      }
    },
  }
}

export const variantScope = (options: PresetMiniOptions = {}): Variant<Theme> => {
  const scopeRE = new RegExp(`^scope-([_\d\w]+)${options.separator}`)
  return {
    name: 'scope',
    match(matcher) {
      const match = matcher.match(scopeRE)
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
