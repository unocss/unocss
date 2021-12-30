import type { CSSEntries, CSSObject, DynamicMatcher, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { cornerMap, directionMap, handler as h, parseColor } from '../utils'

export const borders: Rule[] = [
  // size
  [/^border$/, handlerBorder],
  [/^(?:border|b)()-(.+)$/, handlerBorder],
  [/^(?:border|b)-([^-]+)(?:-(.+))?$/, handlerBorder],
  [/^(?:border|b)()-size-(.+)$/, handlerBorderSize],
  [/^(?:border|b)-([^-]+)-size-(.+)$/, handlerBorderSize],

  // colors
  [/^(?:border|b)()-(.+)$/, handlerBorderColor],
  [/^(?:border|b)-([^-]+)(?:-(.+))?$/, handlerBorderColor],
  [/^(?:border|b)-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-border-opacity': h.bracket.percent(opacity) })],
  [/^(?:border|b)-([^-]+)-op(?:acity)?-?(.+)$/, ([, a, opacity]) => {
    const v = h.bracket.percent(opacity)
    const d = directionMap[a]
    if (v !== undefined && d)
      return d.map(i => [`--un-border${i}-opacity`, v]) as CSSEntries
  }],

  // radius
  [/^(?:border-)?(?:rounded|rd)$/, handlerRounded],
  [/^(?:border-)?(?:rounded|rd)(?:-(.+))?$/, handlerRounded],
  [/^(?:border-)?(?:rounded|rd)(?:-([^-]+))?(?:-(.+))?$/, handlerRounded],

  // style
  ['border-solid', { 'border-style': 'solid' }],
  ['border-dashed', { 'border-style': 'dashed' }],
  ['border-dotted', { 'border-style': 'dotted' }],
  ['border-double', { 'border-style': 'double' }],
  ['border-none', { 'border-style': 'none' }],
]

const borderHasColor = (color: string, { theme }: RuleContext<Theme>) => {
  return color !== undefined && !!parseColor(color, theme)?.color
}

const borderColorResolver = (direction: string): DynamicMatcher => ([, body]: string[], { theme }: RuleContext<Theme>): CSSObject | undefined => {
  const data = parseColor(body, theme)

  if (!data)
    return

  const { opacity, color, rgba } = data

  if (!color)
    return

  const a = opacity
    ? opacity[0] === '['
      ? h.bracket.percent(opacity)!
      : (parseFloat(opacity) / 100)
    : rgba?.[3]

  if (rgba) {
    if (a != null && !Number.isNaN(a)) {
      // @ts-expect-error
      rgba[3] = typeof a === 'string' && !a.includes('%')
        ? parseFloat(a)
        : a
      return {
        [`border${direction}-color`]: `rgba(${rgba.join(',')})`,
      }
    }
    else {
      if (direction === '') {
        return {
          '--un-border-opacity': (opacity && h.cssvar(opacity)) ?? 1,
          [`border${direction}-color`]: `rgba(${rgba.slice(0, 3).join(',')},var(--un-border${direction}-opacity))`,
        }
      }
      else {
        return {
          '--un-border-opacity': (opacity && h.cssvar(opacity)) ?? 1,
          [`--un-border${direction}-opacity`]: 'var(--un-border-opacity)',
          [`border${direction}-color`]: `rgba(${rgba.slice(0, 3).join(',')},var(--un-border${direction}-opacity))`,
        }
      }
    }
  }
  else {
    return {
      [`border${direction}-color`]: color.replace('%alpha', `${a || 1}`),
    }
  }
}

function handlerBorder(m: string[]): CSSEntries | undefined {
  const borderSizes = handlerBorderSize(m)
  if (borderSizes) {
    return [
      ...borderSizes,
      ['border-style', 'solid'],
    ]
  }
}

function handlerBorderSize([, a, b]: string[]): CSSEntries | undefined {
  const [d, s = '1'] = directionMap[a] ? [a, b] : ['', a]
  const v = h.bracket.px(s)
  if (v !== undefined)
    return directionMap[d].map(i => [`border${i}-width`, v])
}

function handlerBorderColor([, a, c]: string[], ctx: RuleContext) {
  if (borderHasColor(c, ctx)) {
    return Object.assign({},
      ...directionMap[directionMap[a] ? a : '']
        .map(i => borderColorResolver(i)(['', c], ctx)),
    ) as CSSObject
  }
}

function handlerRounded([, a, b]: string[], { theme }: RuleContext<Theme>): CSSEntries | undefined {
  const [d, s = 'DEFAULT'] = cornerMap[a] ? [a, b] : ['', a]
  const v = theme.borderRadius?.[s] || h.auto.rem.fraction.bracket.cssvar(s)
  if (v !== undefined)
    return cornerMap[d].map(i => [`border${i}-radius`, v])
}
