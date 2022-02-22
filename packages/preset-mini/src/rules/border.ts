import type { CSSEntries, CSSObject, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { colorToString, cornerMap, directionMap, handler as h, hasParseableColor, parseColor } from '../utils'

export const borders: Rule[] = [
  // compound
  [/^(?:border|b)()(?:-(.+))?$/, handlerBorder],
  [/^(?:border|b)-([xy])(?:-(.+))?$/, handlerBorder],
  [/^(?:border|b)-([rltbse])(?:-(.+))?$/, handlerBorder],
  [/^(?:border|b)-(block|inline)(?:-(.+))?$/, handlerBorder],
  [/^(?:border|b)-([bi][se])(?:-(.+))?$/, handlerBorder],

  // size
  [/^(?:border|b)-()(?:width|size)-(.+)$/, handlerBorderSize],
  [/^(?:border|b)-([xy])-(?:width|size)-(.+)$/, handlerBorderSize],
  [/^(?:border|b)-([rltbse])-(?:width|size)-(.+)$/, handlerBorderSize],
  [/^(?:border|b)-(block|inline)-(?:width|size)-(.+)$/, handlerBorderSize],
  [/^(?:border|b)-([bi][se])-(?:width|size)-(.+)$/, handlerBorderSize],

  // colors
  [/^(?:border|b)-()(?:color-)?(.+)$/, handlerBorderColor],
  [/^(?:border|b)-([xy])-(?:color-)?(.+)$/, handlerBorderColor],
  [/^(?:border|b)-([rltbse])-(?:color-)?(.+)$/, handlerBorderColor],
  [/^(?:border|b)-(block|inline)-(?:color-)?(.+)$/, handlerBorderColor],
  [/^(?:border|b)-([bi][se])-(?:color-)?(.+)$/, handlerBorderColor],

  // opacity
  [/^(?:border|b)-()op(?:acity)?-?(.+)$/, handlerBorderOpacity],
  [/^(?:border|b)-([xy])-op(?:acity)?-?(.+)$/, handlerBorderOpacity],
  [/^(?:border|b)-([rltbse])-op(?:acity)?-?(.+)$/, handlerBorderOpacity],
  [/^(?:border|b)-(block|inline)-op(?:acity)?-?(.+)$/, handlerBorderOpacity],
  [/^(?:border|b)-([bi][se])-op(?:acity)?-?(.+)$/, handlerBorderOpacity],

  // radius
  [/^(?:border-)?(?:rounded|rd)()(?:-(.+))?$/, handlerRounded],
  [/^(?:border-)?(?:rounded|rd)-([rltb])(?:-(.+))?$/, handlerRounded],
  [/^(?:border-)?(?:rounded|rd)-([rltb]{2})(?:-(.+))?$/, handlerRounded],
  [/^(?:border-)?(?:rounded|rd)-([bi][se])(?:-(.+))?$/, handlerRounded],
  [/^(?:border-)?(?:rounded|rd)-([bi][se]-[bi][se])(?:-(.+))?$/, handlerRounded],

  // style
  ['border-solid', { 'border-style': 'solid' }],
  ['border-dashed', { 'border-style': 'dashed' }],
  ['border-dotted', { 'border-style': 'dotted' }],
  ['border-double', { 'border-style': 'double' }],
  ['border-hidden', { 'border-style': 'hidden' }],
  ['border-none', { 'border-style': 'none' }],
]

const borderColorResolver = (direction: string) => ([, body]: string[], theme: Theme): CSSObject | undefined => {
  const data = parseColor(body, theme)

  if (!data)
    return

  const { alpha, color, cssColor } = data

  if (cssColor) {
    if (alpha != null) {
      return {
        [`border${direction}-color`]: colorToString(cssColor, alpha),
      }
    }
    if (direction === '') {
      return {
        '--un-border-opacity': cssColor.alpha ?? 1,
        [`border${direction}-color`]: colorToString(cssColor, `var(--un-border${direction}-opacity)`),
      }
    }
    else {
      return {
        // Separate this return since if `direction` is an empty string, the first key will be overwritten by the second.
        '--un-border-opacity': cssColor.alpha ?? 1,
        [`--un-border${direction}-opacity`]: 'var(--un-border-opacity)',
        [`border${direction}-color`]: colorToString(cssColor, `var(--un-border${direction}-opacity)`),
      }
    }
  }
  else if (color) {
    return {
      [`border${direction}-color`]: color.replace('%alpha', `${alpha ?? 1}`),
    }
  }
}

function handlerBorder(m: string[], ctx: RuleContext): CSSEntries | undefined {
  const borderSizes = handlerBorderSize(m, ctx)
  if (borderSizes) {
    return [
      ...borderSizes,
      ['border-style', 'solid'],
    ]
  }
}

function handlerBorderSize([, a = '', b]: string[], { theme }: RuleContext<Theme>): CSSEntries | undefined {
  const v = theme.lineWidth?.[b || 'DEFAULT'] ?? h.bracket.cssvar.px(b || '1')
  if (a in directionMap && v != null)
    return directionMap[a].map(i => [`border${i}-width`, v])
}

function handlerBorderColor([, a = '', c]: string[], { theme }: RuleContext<Theme>): CSSObject | undefined {
  if (a in directionMap && hasParseableColor(c, theme)) {
    return Object.assign(
      {},
      ...directionMap[a].map(i => borderColorResolver(i)(['', c], theme)),
    )
  }
}

function handlerBorderOpacity([, a = '', opacity]: string[]): CSSEntries | undefined {
  const v = h.bracket.percent(opacity)
  if (a in directionMap && v != null)
    return directionMap[a].map(i => [`--un-border${i}-opacity`, v])
}

function handlerRounded([, a = '', s]: string[], { theme }: RuleContext<Theme>): CSSEntries | undefined {
  const v = theme.borderRadius?.[s || 'DEFAULT'] || h.bracket.cssvar.fraction.rem(s || '1')
  if (a in cornerMap && v != null)
    return cornerMap[a].map(i => [`border${i}-radius`, v])
}
