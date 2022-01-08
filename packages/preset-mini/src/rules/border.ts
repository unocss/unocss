import type { CSSEntries, CSSObject, DynamicMatcher, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { cornerMap, directionMap, handler as h, parseColor } from '../utils'

export const borders: Rule[] = [
  // compound
  [/^(?:border|b)()(?:-(.+))?$/, handlerBorder],
  [/^(?:border|b)-([xy])(?:-(.+))?$/, handlerBorder],
  [/^(?:border|b)-([rltbse])(?:-(.+))?$/, handlerBorder],

  // size
  [/^(?:border|b)-()(?:width|size)-(.+)$/, handlerBorderSize],
  [/^(?:border|b)-([xy])-(?:width|size)-(.+)$/, handlerBorderSize],
  [/^(?:border|b)-([rltbse])-(?:width|size)-(.+)$/, handlerBorderSize],

  // colors
  [/^(?:border|b)-()(?:color-)?(.+)$/, handlerBorderColor],
  [/^(?:border|b)-([xy])-(?:color-)?(.+)$/, handlerBorderColor],
  [/^(?:border|b)-([rltbse])-(?:color-)?(.+)$/, handlerBorderColor],

  // opacity
  [/^(?:border|b)-()op(?:acity)?-?(.+)$/, handlerBorderOpacity],
  [/^(?:border|b)-([xy])-op(?:acity)?-?(.+)$/, handlerBorderOpacity],
  [/^(?:border|b)-([rltbse])-op(?:acity)?-?(.+)$/, handlerBorderOpacity],

  // radius
  [/^(?:border-)?(?:rounded|rd)()(?:-(.+))?$/, handlerRounded],
  [/^(?:border-)?(?:rounded|rd)-([xy])(?:-(.+))?$/, handlerRounded],
  [/^(?:border-)?(?:rounded|rd)-([rltb])(?:-(.+))?$/, handlerRounded],
  [/^(?:border-)?(?:rounded|rd)-([rltb]{2})(?:-(.+))?$/, handlerRounded],

  // style
  ['border-solid', { 'border-style': 'solid' }],
  ['border-dashed', { 'border-style': 'dashed' }],
  ['border-dotted', { 'border-style': 'dotted' }],
  ['border-double', { 'border-style': 'double' }],
  ['border-hidden', { 'border-style': 'hidden' }],
  ['border-none', { 'border-style': 'none' }],
]

const borderHasColor = (color: string, { theme }: RuleContext<Theme>) => {
  return color !== undefined && !!parseColor(color, theme)?.color
}

const borderColorResolver = (direction: string): DynamicMatcher => ([, body]: string[], { theme }: RuleContext<Theme>): CSSObject | undefined => {
  const data = parseColor(body, theme)

  if (!data)
    return

  const { alpha, opacity, color, rgba } = data

  if (!color)
    return

  if (rgba) {
    if (alpha != null) {
      return {
        [`border${direction}-color`]: `rgba(${rgba.join(',')})`,
      }
    }
    else {
      if (direction === '') {
        return {
          '--un-border-opacity': (opacity && h.cssvar(opacity)) ?? 1,
          [`border${direction}-color`]: `rgba(${rgba.join(',')},var(--un-border${direction}-opacity))`,
        }
      }
      else {
        return {
          '--un-border-opacity': (opacity && h.cssvar(opacity)) ?? 1,
          [`--un-border${direction}-opacity`]: 'var(--un-border-opacity)',
          [`border${direction}-color`]: `rgba(${rgba.join(',')},var(--un-border${direction}-opacity))`,
        }
      }
    }
  }
  else {
    return {
      [`border${direction}-color`]: color.replace('%alpha', `${alpha || 1}`),
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

function handlerBorderSize([, a = '', b = '1']: string[]): CSSEntries | undefined {
  const v = h.bracket.px(b)
  if (a in directionMap && v != null)
    return directionMap[a].map(i => [`border${i}-width`, v])
}

function handlerBorderColor([, a = '', c]: string[], ctx: RuleContext): CSSObject | undefined {
  if (a in directionMap && borderHasColor(c, ctx)) {
    return Object.assign(
      {},
      ...directionMap[a].map(i => borderColorResolver(i)(['', c], ctx)),
    )
  }
}

function handlerBorderOpacity([, a = '', opacity]: string[]): CSSEntries | undefined {
  const v = h.bracket.percent(opacity)
  if (a in directionMap && v != null)
    return directionMap[a].map(i => [`--un-border${i}-opacity`, v])
}

function handlerRounded([, a = '', s = 'DEFAULT']: string[], { theme }: RuleContext<Theme>): CSSEntries | undefined {
  const v = theme.borderRadius?.[s] || h.auto.rem.fraction.bracket.cssvar(s)
  if (a in cornerMap && v != null)
    return cornerMap[a].map(i => [`border${i}-radius`, v])
}
