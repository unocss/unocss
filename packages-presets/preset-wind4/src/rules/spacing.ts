import type { Rule, RuleContext, VariantHandler } from '@unocss/core'
import type { Theme } from '../theme'
import { defineProperty, directionMap, directionSize, h, numberResolver, themeTracking } from '../utils'

export const paddings: Rule<Theme>[] = [
  [/^pa?()-?(.+)$/, directionSize('padding'), { autocomplete: ['(m|p)<num>', '(m|p)-<num>'] }],
  [/^p-?xy()()$/, directionSize('padding'), { autocomplete: '(m|p)-(xy)' }],
  [/^p-?([xy])(?:-?(.+))?$/, directionSize('padding')],
  [/^p-?([rltbse])(?:-?(.+))?$/, directionSize('padding'), { autocomplete: '(m|p)<directions>-<num>' }],
  [/^p-(block|inline)(?:-(.+))?$/, directionSize('padding'), { autocomplete: '(m|p)-(block|inline)-<num>' }],
  [/^p-?([bi][se])(?:-?(.+))?$/, directionSize('padding'), { autocomplete: '(m|p)-(bs|be|is|ie)-<num>' }],
]

export const margins: Rule<Theme>[] = [
  [/^ma?()-?(.+)$/, directionSize('margin')],
  [/^m-?xy()()$/, directionSize('margin')],
  [/^m-?([xy])(?:-?(.+))?$/, directionSize('margin')],
  [/^m-?([rltbse])(?:-?(.+))?$/, directionSize('margin')],
  [/^m-(block|inline)(?:-(.+))?$/, directionSize('margin')],
  [/^m-?([bi][se])(?:-?(.+))?$/, directionSize('margin')],
]

export const spaces: Rule<Theme>[] = [
  [/^space-([xy])-(.+)$/, handlerSpace, { autocomplete: ['space-(x|y)', 'space-(x|y)-reverse', 'space-(x|y)-$spacing'] }],
  [/^space-([xy])-reverse$/, function* ([m, d]: string[], ctx: RuleContext<Theme>) {
    const { symbols } = ctx
    yield {
      [symbols.variants]: [notLastChildSelectorVariant(m)],
      [`--un-space-${d}-reverse`]: '1',
    }
    yield defineProperty(`--un-space-${d}-reverse`, { initialValue: 0 }, ctx)
  }],
]

export function notLastChildSelectorVariant(s: string): VariantHandler {
  return {
    matcher: s,
    order: 1,
    handle: (input, next) => next({
      ...input,
      parent: `${input.parent ? `${input.parent} $$ ` : ''}${input.selector}`,
      selector: ':where(&>:not(:last-child))',
    }),
  }
}

function* handlerSpace([m, d, s]: string[], ctx: RuleContext<Theme>) {
  const { theme, symbols } = ctx

  let v: string | undefined
  const num = numberResolver(s)
  if (num != null) {
    themeTracking(`spacing`, undefined, ctx)
    v = `calc(var(--spacing) * ${num})`
  }
  else {
    v = theme.spacing?.[s] ?? h.bracket.cssvar.auto.fraction.rem(s || '1', ctx)
  }

  if (v != null) {
    const results = directionMap[d === 'x' ? 'inline' : 'block'].map((item, index): [string, string] => {
      const key = `margin${item}`
      const value = `calc(${v} * ${index === 0 ? `var(--un-space-${d}-reverse)` : `calc(1 - var(--un-space-${d}-reverse))`})`
      return [key, value]
    })

    if (results) {
      yield {
        [symbols.variants]: [notLastChildSelectorVariant(m)],
        [`--un-space-${d}-reverse`]: '0',
        ...Object.fromEntries(results),
      }
      yield defineProperty(`--un-space-${d}-reverse`, { initialValue: 0 }, ctx)
    }
  }
}
