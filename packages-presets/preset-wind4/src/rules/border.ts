import type { CSSEntries, CSSObject, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { cornerMap, directionMap, globalKeywords, h, hasParseableColor, isCSSMathFn, parseColor, passThemeKey, SpecialColorKey } from '../utils'

export const borderStyles = ['solid', 'dashed', 'dotted', 'double', 'hidden', 'none', 'groove', 'ridge', 'inset', 'outset', ...globalKeywords]

export const borders: Rule<Theme>[] = [
  // compound
  [/^(?:border|b)()(?:-(.+))?$/, handlerBorderSize, { autocomplete: '(border|b)-<directions>' }],
  [/^(?:border|b)-([xy])(?:-(.+))?$/, handlerBorderSize],
  [/^(?:border|b)-([rltbse])(?:-(.+))?$/, handlerBorderSize],
  [/^(?:border|b)-(block|inline)(?:-(.+))?$/, handlerBorderSize],
  [/^(?:border|b)-([bi][se])(?:-(.+))?$/, handlerBorderSize],

  // size
  [/^(?:border|b)-()(?:width|size)-(.+)$/, handlerBorderSize, { autocomplete: ['(border|b)-<num>', '(border|b)-<directions>-<num>'] }],
  [/^(?:border|b)-([xy])-(?:width|size)-(.+)$/, handlerBorderSize],
  [/^(?:border|b)-([rltbse])-(?:width|size)-(.+)$/, handlerBorderSize],
  [/^(?:border|b)-(block|inline)-(?:width|size)-(.+)$/, handlerBorderSize],
  [/^(?:border|b)-([bi][se])-(?:width|size)-(.+)$/, handlerBorderSize],

  // colors
  [/^(?:border|b)-()(?:color-)?(.+)$/, handlerBorderColorOrSize, { autocomplete: ['(border|b)-$colors', '(border|b)-<directions>-$colors'] }],
  [/^(?:border|b)-([xy])-(?:color-)?(.+)$/, handlerBorderColorOrSize],
  [/^(?:border|b)-([rltbse])-(?:color-)?(.+)$/, handlerBorderColorOrSize],
  [/^(?:border|b)-(block|inline)-(?:color-)?(.+)$/, handlerBorderColorOrSize],
  [/^(?:border|b)-([bi][se])-(?:color-)?(.+)$/, handlerBorderColorOrSize],

  // opacity
  [/^(?:border|b)-()op(?:acity)?-?(.+)$/, handlerBorderOpacity, { autocomplete: '(border|b)-(op|opacity)-<percent>' }],
  [/^(?:border|b)-([xy])-op(?:acity)?-?(.+)$/, handlerBorderOpacity],
  [/^(?:border|b)-([rltbse])-op(?:acity)?-?(.+)$/, handlerBorderOpacity],
  [/^(?:border|b)-(block|inline)-op(?:acity)?-?(.+)$/, handlerBorderOpacity],
  [/^(?:border|b)-([bi][se])-op(?:acity)?-?(.+)$/, handlerBorderOpacity],

  // radius
  [/^(?:border-|b-)?(?:rounded|rd)()(?:-(.+))?$/, handlerRounded, { autocomplete: ['(border|b)-(rounded|rd)', '(border|b)-(rounded|rd)-$borderRadius', '(rounded|rd)', '(rounded|rd)-$borderRadius'] }],
  [/^(?:border-|b-)?(?:rounded|rd)-([rltbse])(?:-(.+))?$/, handlerRounded],
  [/^(?:border-|b-)?(?:rounded|rd)-([rltb]{2})(?:-(.+))?$/, handlerRounded],
  [/^(?:border-|b-)?(?:rounded|rd)-([bise][se])(?:-(.+))?$/, handlerRounded],
  [/^(?:border-|b-)?(?:rounded|rd)-([bi][se]-[bi][se])(?:-(.+))?$/, handlerRounded],

  // style
  [/^(?:border|b)-(?:style-)?()(.+)$/, handlerBorderStyle, { autocomplete: ['(border|b)-style', `(border|b)-(${borderStyles.join('|')})`, '(border|b)-<directions>-style', `(border|b)-<directions>-(${borderStyles.join('|')})`, `(border|b)-<directions>-style-(${borderStyles.join('|')})`, `(border|b)-style-(${borderStyles.join('|')})`] }],
  [/^(?:border|b)-([xy])-(?:style-)?(.+)$/, handlerBorderStyle],
  [/^(?:border|b)-([rltbse])-(?:style-)?(.+)$/, handlerBorderStyle],
  [/^(?:border|b)-(block|inline)-(?:style-)?(.+)$/, handlerBorderStyle],
  [/^(?:border|b)-([bi][se])-(?:style-)?(.+)$/, handlerBorderStyle],
]

function transformBorderColor(color: string, opacity: string | number | undefined, key: string | undefined, direction: string | undefined): CSSObject {
  const css: CSSObject = {}

  if (color) {
    if (Object.values(SpecialColorKey).includes(color)) {
      css[`border${direction}-color`] = color
    }
    else {
      css[`--un-border-opacity`] = `${opacity || 100}%`
      if (direction && direction !== '') {
        css[`--un-border${direction}-opacity`] = `var(--un-border-opacity)`
      }
      const value = key ? `var(--color-${key})` : color
      css[`border${direction}-color`] = `color-mix(in oklch, ${value} var(--un-border${direction}-opacity), transparent)`
    }
  }

  return css
}

function borderColorResolver(direction: string) {
  return ([, body]: string[], theme: Theme): CSSObject | undefined => {
    const data = parseColor(body, theme)

    if (!data)
      return

    const { opacity, color, key } = data

    if (color)
      return transformBorderColor(color, opacity, key, direction)
  }
}

function handlerBorderSize([, a = '', b = '1']: string[]): CSSEntries | undefined {
  const v = h.bracket.cssvar.global.px(b)
  if (a in directionMap && v != null)
    return directionMap[a].map(i => [`border${i}-width`, v])
}

function handlerBorderColorOrSize([, a = '', b]: string[], ctx: RuleContext<Theme>): CSSEntries | undefined {
  if (a in directionMap) {
    if (isCSSMathFn(h.bracket(b)))
      return handlerBorderSize(['', a, b])

    if (hasParseableColor(b, ctx.theme)) {
      return Object.assign(
        {},
        ...directionMap[a].map(i => borderColorResolver(i)(['', b], ctx.theme)),
      )
    }
  }
}

function handlerBorderOpacity([, a = '', opacity]: string[]): CSSEntries | undefined {
  const v = h.bracket.percent.cssvar(opacity)
  if (a in directionMap && v != null)
    return directionMap[a].map(i => [`--un-border${i}-opacity`, v])
}

function handlerRounded([, a = '', s]: string[], { theme }: RuleContext<Theme>): CSSEntries | undefined {
  if (a in cornerMap) {
    const _s = s || 'DEFAULT'
    if (_s === 'full')
      return cornerMap[a].map(i => [`border${i}-radius`, 'calc(infinity * 1px)'])

    const _v = theme.radius?.[_s] ?? h.bracket.cssvar.global.fraction.rem(_s || '1')
    if (_v != null) {
      return cornerMap[a].map(i => [
        `border${i}-radius`,
        theme.radius && _s in theme.radius && !passThemeKey.includes(_s) ? `var(--un-radius-${_s})` : _v,
      ])
    }
  }
}

export function handlerBorderStyle([, a = '', s]: string[]): CSSEntries | undefined {
  if (borderStyles.includes(s) && a in directionMap) {
    return [
      ['--un-border-style', s],
      ...directionMap[a].map(i => [`border${i}-style`, s]) as CSSEntries,
    ]
  }
}
