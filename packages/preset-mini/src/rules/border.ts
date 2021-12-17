import type { CSSEntries, CSSObject, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { colorResolver, cornerMap, directionMap, handler as h } from '../utils'

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

  // style
  ['border-solid', { 'border-style': 'solid' }],
  ['border-dashed', { 'border-style': 'dashed' }],
  ['border-dotted', { 'border-style': 'dotted' }],
  ['border-double', { 'border-style': 'double' }],
  ['border-none', { 'border-style': 'none' }],

  // radius
  [/^(?:border-)?(?:rounded|rd)$/, handlerRounded],
  [/^(?:border-)?(?:rounded|rd)(?:-(.+))?$/, handlerRounded],
  [/^(?:border-)?(?:rounded|rd)(?:-([^-]+))?(?:-(.+))?$/, handlerRounded],
]

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
  if (c !== undefined && colorResolver('border-color', 'border')(['', c], ctx)) {
    return Object.assign({},
      ...directionMap[directionMap[a] ? a : '']
        .map(i => colorResolver(`border${i}-color`, 'border')(['', c], ctx)),
    ) as CSSObject
  }
}

function handlerRounded([, a, b]: string[], { theme }: RuleContext<Theme>): CSSEntries | undefined {
  const [d, s = 'DEFAULT'] = cornerMap[a] ? [a, b] : ['', a]
  const v = theme.borderRadius?.[s] || h.auto.rem.fraction.bracket.cssvar(s)
  if (v !== undefined)
    return cornerMap[d].map(i => [`border${i}-radius`, v])
}
