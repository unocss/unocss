import type { CSSEntries, CSSObject, CSSValueInput, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { notNull } from '@unocss/core'
import { colorCSSGenerator, cornerMap, directionMap, generateThemeVariable, globalKeywords, h, hasParseableColor, isCSSMathFn, parseColor, SpecialColorKey, themeTracking } from '../utils'

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
  [/^(?:border-|b-)?(?:rounded|rd)()(?:-(.+))?$/, handlerRounded, { autocomplete: ['(border|b)-(rounded|rd)', '(border|b)-(rounded|rd)-$radius', '(rounded|rd)', '(rounded|rd)-$radius'] }],
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

function borderColorResolver(direction: string) {
  return ([, body]: string[], ctx: RuleContext<Theme>): [CSSObject, ...CSSValueInput[]] | undefined => {
    const data = parseColor(body, ctx.theme)
    const result = colorCSSGenerator(data, `border${direction}-color`, `border${direction}`, ctx)

    if (result) {
      const css = result[0]
      if (
        data?.color && !Object.values(SpecialColorKey).includes(data.color)
        && !data.alpha
        && direction && direction !== ''
      ) {
        css[`--un-border${direction}-opacity`] = `var(--un-border-opacity)`
      }

      return result
    }
  }
}

function handlerBorderSize([, a = '', b = '1']: string[]): CSSEntries | undefined {
  const v = h.bracket.cssvar.global.px(b)
  if (a in directionMap && v != null)
    return directionMap[a].map(i => [`border${i}-width`, v])
}

function handlerBorderColorOrSize([, a = '', b]: string[], ctx: RuleContext<Theme>): CSSEntries | (CSSValueInput | string)[] | undefined {
  if (a in directionMap) {
    if (isCSSMathFn(h.bracket(b)))
      return handlerBorderSize(['', a, b])

    if (hasParseableColor(b, ctx.theme)) {
      const directions = directionMap[a].map(i => borderColorResolver(i)(['', b], ctx))
        .filter(notNull)

      return [
        directions
          .map(d => d[0])
          .reduce((acc, item) => {
            // Merge multiple direction CSSObject into one
            Object.assign(acc, item)
            return acc
          }, {}),
        ...directions.flatMap(d => d.slice(1)),
      ]
    }
  }
}

function handlerBorderOpacity([, a = '', opacity]: string[]): CSSEntries | undefined {
  const v = h.bracket.percent.cssvar(opacity)
  if (a in directionMap && v != null)
    return directionMap[a].map(i => [`--un-border${i}-opacity`, v])
}

function handlerRounded([, a = '', s = 'DEFAULT']: string[], { theme }: RuleContext<Theme>): CSSEntries | undefined {
  if (a in cornerMap) {
    if (s === 'full')
      return cornerMap[a].map(i => [`border${i}-radius`, 'calc(infinity * 1px)'])

    const _v = theme.radius?.[s] ?? h.bracket.cssvar.global.fraction.rem(s)
    if (_v != null) {
      const isVar = theme.radius && s in theme.radius
      if (isVar) {
        themeTracking(`radius`, s)
      }

      return cornerMap[a].map(i => [
        `border${i}-radius`,
        isVar ? generateThemeVariable('radius', s) : _v,
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
