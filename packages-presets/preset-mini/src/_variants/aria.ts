import type { Variant, VariantContext, VariantObject } from '@unocss/core'
import type { PresetMiniOptions } from '..'
import type { Theme } from '../theme'
import { escapeRegExp, escapeSelector } from '@unocss/core'
import { h, variantGetParameter } from '../utils'

export const variantAria: VariantObject = {
  name: 'aria',
  match(matcher, ctx: VariantContext<Theme>) {
    const variant = variantGetParameter('aria-', matcher, ctx.generator.config.separators)
    if (variant) {
      const [match, rest] = variant
      const aria = h.bracket(match) ?? ctx.theme.aria?.[match] ?? ''
      if (aria) {
        return {
          matcher: rest,
          selector: s => `${s}[aria-${aria}]`,
        }
      }
    }
  },
  multiPass: true,
}

function taggedAria(tagName: string, combinator: string, options: PresetMiniOptions = {}): Variant {
  return {
    name: `${tagName}-aria`,
    match(matcher, ctx: VariantContext<Theme>) {
      const variant = variantGetParameter(`${tagName}-aria-`, matcher, ctx.generator.config.separators)
      if (variant) {
        const [match, rest, label] = variant
        const ariaAttribute = h.bracket(match) ?? ctx.theme.aria?.[match] ?? ''
        if (ariaAttribute) {
          const attributify = !!options?.attributifyPseudo
          let firstPrefix = options?.prefix ?? ''
          firstPrefix = (Array.isArray(firstPrefix) ? firstPrefix : [firstPrefix]).filter(Boolean)[0] ?? ''

          const parent = `${attributify ? `[${firstPrefix}${tagName}=""]` : `.${firstPrefix}${tagName}`}`
          const escapedLabel = escapeSelector(label ? `/${label}` : '')

          return {
            matcher: rest,
            handle: (input, next) => {
              const regexp = new RegExp(`${escapeRegExp(parent)}${escapeRegExp(escapedLabel)}(?:\\[.+?\\])+`)
              const match = input.prefix.match(regexp)

              let nextPrefix
              if (match) {
                const insertIndex = (match.index ?? 0) + parent.length + escapedLabel.length
                nextPrefix = [
                  input.prefix.slice(0, insertIndex),
                  `[aria-${ariaAttribute}]`,
                  input.prefix.slice(insertIndex),
                ].join('')
              }
              else {
                const prefixGroupIndex = Math.max(input.prefix.indexOf(parent), 0)
                nextPrefix = [
                  input.prefix.slice(0, prefixGroupIndex),
                  parent,
                  escapedLabel,
                  `[aria-${ariaAttribute}]`,
                  combinator,
                  input.prefix.slice(prefixGroupIndex),
                ].join('')
              }

              return next({
                ...input,
                prefix: nextPrefix,
              })
            },
          }
        }
      }
    },
    multiPass: true,
  }
}

function taggedHasAria(): Variant {
  return {
    name: 'has-aria',
    match(matcher, ctx: VariantContext<Theme>) {
      const variant = variantGetParameter('has-aria-', matcher, ctx.generator.config.separators)
      if (variant) {
        const [match, rest] = variant
        const ariaAttribute = h.bracket(match) ?? ctx.theme.aria?.[match] ?? ''
        if (ariaAttribute) {
          return {
            matcher: rest,
            handle: (input, next) => next({
              ...input,
              pseudo: `${input.pseudo}:has([aria-${ariaAttribute}])`,
            }),
          }
        }
      }
    },
    multiPass: true,
  }
}

export function variantTaggedAriaAttributes(options: PresetMiniOptions = {}): Variant[] {
  return [
    taggedAria('group', ' ', options),
    taggedAria('peer', '~', options),
    taggedAria('parent', '>', options),
    taggedAria('previous', '+', options),
    taggedHasAria(),
  ]
}
