import type { CSSEntries, CSSObject, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { colorOpacityToString, colorToString, cornerMap, directionMap, globalKeywords, handler as h, hasParseableColor, parseColor } from '../utils'

const borderStyles = ['solid', 'dashed', 'dotted', 'double', 'hidden', 'none', 'groove', 'ridge', 'inset', 'outset', ...globalKeywords]

export const borders: Rule[] = [
  // compound
  [/^(?:border|b)()(?:-(.+))?$/, handlerBorder, { autocomplete: '(border|b)-<directions>' }],
  [/^(?:border|b)-([xy])(?:-(.+))?$/, handlerBorder],
  [/^(?:border|b)-([rltbse])(?:-(.+))?$/, handlerBorder],
  [/^(?:border|b)-(block|inline)(?:-(.+))?$/, handlerBorder],
  [/^(?:border|b)-([bi][se])(?:-(.+))?$/, handlerBorder],

  // size
  [/^(?:border|b)-()(?:width|size)-(.+)$/, handlerBorderSize, { autocomplete: ['(border|b)-<num>', '(border|b)-<directions>-<num>'] }],
  [/^(?:border|b)-([xy])-(?:width|size)-(.+)$/, handlerBorderSize],
  [/^(?:border|b)-([rltbse])-(?:width|size)-(.+)$/, handlerBorderSize],
  [/^(?:border|b)-(block|inline)-(?:width|size)-(.+)$/, handlerBorderSize],
  [/^(?:border|b)-([bi][se])-(?:width|size)-(.+)$/, handlerBorderSize],

  // colors
  [/^(?:border|b)-()(?:color-)?(.+)$/, handlerBorderColor, { autocomplete: ['(border|b)-$colors', '(border|b)-<directions>-$colors'] }],
  [/^(?:border|b)-([xy])-(?:color-)?(.+)$/, handlerBorderColor],
  [/^(?:border|b)-([rltbse])-(?:color-)?(.+)$/, handlerBorderColor],
  [/^(?:border|b)-(block|inline)-(?:color-)?(.+)$/, handlerBorderColor],
  [/^(?:border|b)-([bi][se])-(?:color-)?(.+)$/, handlerBorderColor],

  // opacity
  [/^(?:border|b)-()op(?:acity)?-?(.+)$/, handlerBorderOpacity, { autocomplete: '(border|b)-(op|opacity)-<percent>' }],
  [/^(?:border|b)-([xy])-op(?:acity)?-?(.+)$/, handlerBorderOpacity],
  [/^(?:border|b)-([rltbse])-op(?:acity)?-?(.+)$/, handlerBorderOpacity],
  [/^(?:border|b)-(block|inline)-op(?:acity)?-?(.+)$/, handlerBorderOpacity],
  [/^(?:border|b)-([bi][se])-op(?:acity)?-?(.+)$/, handlerBorderOpacity],

  // radius
  [/^(?:border-|b-)?(?:rounded|rd)()(?:-(.+))?$/, handlerRounded, { autocomplete: ['(border|b)-(rounded|rd)', '(border|b)-(rounded|rd)-<num>', '(rounded|rd)', '(rounded|rd)-<num>'] }],
  [/^(?:border-|b-)?(?:rounded|rd)-([rltb])(?:-(.+))?$/, handlerRounded],
  [/^(?:border-|b-)?(?:rounded|rd)-([rltb]{2})(?:-(.+))?$/, handlerRounded],
  [/^(?:border-|b-)?(?:rounded|rd)-([bi][se])(?:-(.+))?$/, handlerRounded],
  [/^(?:border-|b-)?(?:rounded|rd)-([bi][se]-[bi][se])(?:-(.+))?$/, handlerRounded],

  // style
  [/^(?:border|b)-(?:style-)?()(.+)$/, handlerBorderStyle, { autocomplete: ['(border|b)-style', `(border|b)-(${borderStyles.join('|')})`, '(border|b)-<directions>-style', `(border|b)-<directions>-(${borderStyles.join('|')})`, `(border|b)-<directions>-style-(${borderStyles.join('|')})`, `(border|b)-style-(${borderStyles.join('|')})`] }],
  [/^(?:border|b)-([xy])-(?:style-)?(.+)$/, handlerBorderStyle],
  [/^(?:border|b)-([rltbse])-(?:style-)?(.+)$/, handlerBorderStyle],
  [/^(?:border|b)-(block|inline)-(?:style-)?(.+)$/, handlerBorderStyle],
  [/^(?:border|b)-([bi][se])-(?:style-)?(.+)$/, handlerBorderStyle],
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
        '--un-border-opacity': colorOpacityToString(cssColor),
        'border-color': colorToString(cssColor, 'var(--un-border-opacity)'),
      }
    }
    else {
      return {
        // Separate this return since if `direction` is an empty string, the first key will be overwritten by the second.
        '--un-border-opacity': colorOpacityToString(cssColor),
        [`--un-border${direction}-opacity`]: 'var(--un-border-opacity)',
        [`border${direction}-color`]: colorToString(cssColor, `var(--un-border${direction}-opacity)`),
      }
    }
  }
  else if (color) {
    return {
      [`border${direction}-color`]: colorToString(color, alpha),
    }
  }
}

function handlerBorder(m: string[], ctx: RuleContext): CSSEntries | undefined {
  const borderSizes = handlerBorderSize(m, ctx)
  const borderStyle = handlerBorderStyle(['', m[1], 'solid'])
  if (borderSizes && borderStyle) {
    return [
      ...borderSizes,
      ...borderStyle,
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

function handlerBorderStyle([, a = '', s]: string[]): CSSEntries | undefined {
  if (borderStyles.includes(s) && a in directionMap)
    return directionMap[a].map(i => [`border${i}-style`, s])
}
