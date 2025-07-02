import type { Variant, VariantContext, VariantObject } from '@unocss/core'
import type { PresetMiniOptions } from '..'
import type { Theme } from '../theme'
import { escapeRegExp, escapeSelector } from '@unocss/core'
import { h, variantGetParameter } from '../utils'

export const variantDataAttribute: VariantObject = {
  name: 'data',
  match(matcher, ctx: VariantContext<Theme>) {
    const variant = variantGetParameter('data-', matcher, ctx.generator.config.separators)
    if (variant) {
      const [match, rest] = variant
      const dataAttribute = h.bracket(match) ?? ctx.theme.data?.[match] ?? ''
      if (dataAttribute) {
        return {
          matcher: rest,
          selector: s => `${s}[data-${dataAttribute}]`,
        }
      }
    }
  },
  multiPass: true,
}

function taggedData(tagName: string, combinator: string, options: PresetMiniOptions = {}): Variant {
  return {
    name: `${tagName}-data`,
    match(matcher, ctx: VariantContext<Theme>) {
      const variant = variantGetParameter(`${tagName}-data-`, matcher, ctx.generator.config.separators)
      if (variant) {
        const [match, rest, label] = variant
        const dataAttribute = h.bracket(match) ?? ctx.theme.data?.[match] ?? ''
        if (dataAttribute) {
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
                  `[data-${dataAttribute}]`,
                  input.prefix.slice(insertIndex),
                ].join('')
              }
              else {
                const prefixGroupIndex = Math.max(input.prefix.indexOf(parent), 0)
                nextPrefix = [
                  input.prefix.slice(0, prefixGroupIndex),
                  parent,
                  escapedLabel,
                  `[data-${dataAttribute}]`,
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

function taggedHasData(): Variant {
  return {
    name: 'has-data',
    match(matcher, ctx: VariantContext<Theme>) {
      const variant = variantGetParameter('has-data-', matcher, ctx.generator.config.separators)
      if (variant) {
        const [match, rest] = variant
        const dataAttribute = h.bracket(match) ?? ctx.theme.data?.[match] ?? ''
        if (dataAttribute) {
          return {
            matcher: rest,
            handle: (input, next) => next({
              ...input,
              pseudo: `${input.pseudo}:has([data-${dataAttribute}])`,
            }),
          }
        }
      }
    },
    multiPass: true,
  }
}

export function variantTaggedDataAttributes(options: PresetMiniOptions = {}): Variant[] {
  return [
    taggedData('group', ' ', options),
    taggedData('peer', '~', options),
    taggedData('parent', '>', options),
    taggedData('previous', '+', options),
    taggedHasData(),
  ]
}
