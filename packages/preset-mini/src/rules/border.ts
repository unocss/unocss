import type { CSSEntries, CSSObject, Rule, RuleContext, SuggestionContext } from '@unocss/core'
import type { Theme } from '../theme'
import { MiniSuggestionBuilder, colorToString, cornerMap, directionMap, handler as h, hasParseableColor, parseColor } from '../utils'

export const borders: Rule[] = [
  // compound
  [/^(?:border|b)()(?:-(.+))?$/, handlerBorder, suggestBorder],
  [/^(?:border|b)-([xy])(?:-(.+))?$/, handlerBorder, suggestBorder],
  [/^(?:border|b)-([rltbse])(?:-(.+))?$/, handlerBorder, suggestBorder],
  [/^(?:border|b)-(block|inline)(?:-(.+))?$/, handlerBorder, suggestBorder],
  [/^(?:border|b)-([bi][se])(?:-(.+))?$/, handlerBorder, suggestBorder],

  // size
  [/^(?:border|b)-()(?:width|size)-(.+)$/, handlerBorderSize, suggestBorder],
  [/^(?:border|b)-([xy])-(?:width|size)-(.+)$/, handlerBorderSize, suggestBorder],
  [/^(?:border|b)-([rltbse])-(?:width|size)-(.+)$/, handlerBorderSize, suggestBorder],
  [/^(?:border|b)-(block|inline)-(?:width|size)-(.+)$/, handlerBorderSize, suggestBorder],
  [/^(?:border|b)-([bi][se])-(?:width|size)-(.+)$/, handlerBorderSize, suggestBorder],

  // colors
  [/^(?:border|b)-()(?:color-)?(.+)$/, handlerBorderColor, suggestBorder],
  [/^(?:border|b)-([xy])-(?:color-)?(.+)$/, handlerBorderColor, suggestBorder],
  [/^(?:border|b)-([rltbse])-(?:color-)?(.+)$/, handlerBorderColor, suggestBorder],
  [/^(?:border|b)-(block|inline)-(?:color-)?(.+)$/, handlerBorderColor, suggestBorder],
  [/^(?:border|b)-([bi][se])-(?:color-)?(.+)$/, handlerBorderColor, suggestBorder],

  // opacity
  [/^(?:border|b)-()op(?:acity)?-?(.+)$/, handlerBorderOpacity, suggestBorder],
  [/^(?:border|b)-([xy])-op(?:acity)?-?(.+)$/, handlerBorderOpacity, suggestBorder],
  [/^(?:border|b)-([rltbse])-op(?:acity)?-?(.+)$/, handlerBorderOpacity, suggestBorder],
  [/^(?:border|b)-(block|inline)-op(?:acity)?-?(.+)$/, handlerBorderOpacity, suggestBorder],
  [/^(?:border|b)-([bi][se])-op(?:acity)?-?(.+)$/, handlerBorderOpacity, suggestBorder],

  // radius
  [/^(?:border-)?(?:rounded|rd)()(?:-(.+))?$/, handlerRounded, suggestBorder],
  [/^(?:border-)?(?:rounded|rd)-([rltb])(?:-(.+))?$/, handlerRounded, suggestBorder],
  [/^(?:border-)?(?:rounded|rd)-([rltb]{2})(?:-(.+))?$/, handlerRounded, suggestBorder],
  [/^(?:border-)?(?:rounded|rd)-([bi][se])(?:-(.+))?$/, handlerRounded, suggestBorder],
  [/^(?:border-)?(?:rounded|rd)-([bi][se]-[bi][se])(?:-(.+))?$/, handlerRounded, suggestBorder],

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

function suggestBorder(i: string, ctx: SuggestionContext<Theme>): string[] | undefined {
  return new MiniSuggestionBuilder(i, ctx)
    .withOptions(['border', 'b'], true)
    .withEither([
      b => b
        .withMaybeOptions(Object.keys(directionMap).filter(Boolean), true)
        .withEither([
          b => b.withMaybeOptions([], ['width', 'size'])
            .withOptions(Array.from(new Set([
              ...Object.keys(ctx.theme.lineWidth || {}).filter(i => i !== 'DEFAULT'),
              '0', '2', '4', '8',
            ]))),
          b => b.withMaybeOptions([], ['color']).withColor(),
          b => b.withOptions([], ['op', 'opacity']),
        ]),
      b => b.withOptions([], ['rounded', 'rd'])
        .withMaybeOptions(Object.keys(cornerMap).filter(Boolean), true)
        .withOptions(Object.keys(ctx.theme.borderRadius || {}).filter(i => i !== 'DEFAULT')),
    ])
    .collect()
}
