import type { CSSEntries, CSSObject, Rule, RuleContext } from '@unocss/core'
import type { CSSColorValue } from '@unocss/rule-utils'
import { colorOpacityToString, colorToString } from '@unocss/rule-utils'
import type { Theme } from '../theme'
import { cornerMap, directionMap, globalKeywords, h, hasParseableColor, isCSSMathFn, parseColor } from '../utils'

export const borderStyles = ['solid', 'dashed', 'dotted', 'double', 'hidden', 'none', 'groove', 'ridge', 'inset', 'outset', ...globalKeywords]

export const borders: Rule[] = [
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

function transformBorderColor(color: string | CSSColorValue, alpha: string | number | undefined, direction: string | undefined): CSSObject {
  if (alpha != null) {
    return {
      [`border${direction}-color`]: colorToString(color, alpha),
    }
  }
  if (direction === '') {
    const object: CSSObject = {}
    const opacityVar = `--un-border-opacity`
    const result = colorToString(color, `var(${opacityVar})`)

    if (result.includes(opacityVar))
      object[opacityVar] = typeof color === 'string' ? 1 : colorOpacityToString(color)
    object['border-color'] = result

    return object
  }
  else {
    const object: CSSObject = {}
    const opacityVar = '--un-border-opacity'
    const opacityDirectionVar = `--un-border${direction}-opacity`
    const result = colorToString(color, `var(${opacityDirectionVar})`)
    if (result.includes(opacityDirectionVar)) {
      object[opacityVar] = typeof color === 'string' ? 1 : colorOpacityToString(color)
      object[opacityDirectionVar] = `var(${opacityVar})`
    }
    object[`border${direction}-color`] = result

    return object
  }
}

function borderColorResolver(direction: string) {
  return ([, body]: string[], theme: Theme): CSSObject | undefined => {
    const data = parseColor(body, theme, 'borderColor')

    if (!data)
      return

    const { alpha, color, cssColor } = data

    if (cssColor)
      return transformBorderColor(cssColor, alpha, direction)

    else if (color)
      return transformBorderColor(color, alpha, direction)
  }
}

function handlerBorderSize([, a = '', b]: string[], { theme }: RuleContext<Theme>): CSSEntries | undefined {
  const v = theme.lineWidth?.[b || 'DEFAULT'] ?? h.bracket.cssvar.global.px(b || '1')
  if (a in directionMap && v != null)
    return directionMap[a].map(i => [`border${i}-width`, v])
}

function handlerBorderColorOrSize([, a = '', b]: string[], ctx: RuleContext<Theme>): CSSEntries | undefined {
  if (a in directionMap) {
    if (isCSSMathFn(h.bracket(b)))
      return handlerBorderSize(['', a, b], ctx)
    if (hasParseableColor(b, ctx.theme, 'borderColor')) {
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
  const v = theme.borderRadius?.[s || 'DEFAULT'] || h.bracket.cssvar.global.fraction.rem(s || '1')
  if (a in cornerMap && v != null)
    return cornerMap[a].map(i => [`border${i}-radius`, v])
}

export function handlerBorderStyle([, a = '', s]: string[]): CSSEntries | undefined {
  if (borderStyles.includes(s) && a in directionMap)
    return directionMap[a].map(i => [`border${i}-style`, s])
}
