import type { CSSObject, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { toArray } from '@unocss/core'
import { colorableShadows, colorResolver, globalKeywords, h, isCSSMathFn, isFamilyType, splitShorthand } from '../utils'

export const fonts: Rule<Theme>[] = [
  // text
  [/^text-(.+)$/, handleText, { autocomplete: 'text-$fontSize' }],

  // text size
  [/^(?:text|font)-size-(.+)$/, handleSize, { autocomplete: 'text-size-$fontSize' }],

  // text colors
  [/^text-(?:color-)?(.+)$/, handlerColorOrSize, { autocomplete: 'text-$colors' }],

  // colors
  [/^(?:color|c)-(.+)$/, colorResolver('color', 'text', 'textColor'), { autocomplete: '(color|c)-$colors' }],

  // style
  [/^(?:text|color|c)-(.+)$/, ([, v]) => globalKeywords.includes(v) ? { color: v } : undefined, { autocomplete: `(text|color|c)-(${globalKeywords.join('|')})` }],

  // opacity
  [/^(?:text|color|c)-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-text-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: '(text|color|c)-(op|opacity)-<percent>' }],

  // weights
  [
    /^(?:font|fw)-?([^-]+)$/,
    ([, s], { theme }) => ({ 'font-weight': theme.fontWeight?.[s] || h.bracket.global.number(s) }),
    {
      autocomplete: [
        '(font|fw)-(100|200|300|400|500|600|700|800|900)',
        '(font|fw)-$fontWeight',
      ],
    },
  ],

  // leadings
  [
    /^(?:font-)?(?:leading|lh|line-height)-(.+)$/,
    ([, s], { theme }) => ({ 'line-height': handleThemeByKey(s, theme, 'lineHeight') }),
    { autocomplete: '(leading|lh|line-height)-$lineHeight' },
  ],

  // synthesis
  ['font-synthesis-weight', { 'font-synthesis': 'weight' }],
  ['font-synthesis-style', { 'font-synthesis': 'style' }],
  ['font-synthesis-small-caps', { 'font-synthesis': 'small-caps' }],
  ['font-synthesis-none', { 'font-synthesis': 'none' }],
  [/^font-synthesis-(.+)$/, ([, s]) => ({ 'font-synthesis': h.bracket.cssvar.global(s) })],

  // tracking
  [
    /^(?:font-)?tracking-(.+)$/,
    ([, s], { theme }) => ({ 'letter-spacing': theme.letterSpacing?.[s] || h.bracket.cssvar.global.rem(s) }),
    { autocomplete: 'tracking-$letterSpacing' },
  ],

  // word-spacing
  [
    /^(?:font-)?word-spacing-(.+)$/,
    ([, s], { theme }) => ({ 'word-spacing': theme.wordSpacing?.[s] || h.bracket.cssvar.global.rem(s) }),
    { autocomplete: 'word-spacing-$wordSpacing' },
  ],

  // stretch
  ['font-stretch-normal', { 'font-stretch': 'normal' }],
  ['font-stretch-ultra-condensed', { 'font-stretch': 'ultra-condensed' }],
  ['font-stretch-extra-condensed', { 'font-stretch': 'extra-condensed' }],
  ['font-stretch-condensed', { 'font-stretch': 'condensed' }],
  ['font-stretch-semi-condensed', { 'font-stretch': 'semi-condensed' }],
  ['font-stretch-semi-expanded', { 'font-stretch': 'semi-expanded' }],
  ['font-stretch-expanded', { 'font-stretch': 'expanded' }],
  ['font-stretch-extra-expanded', { 'font-stretch': 'extra-expanded' }],
  ['font-stretch-ultra-expanded', { 'font-stretch': 'ultra-expanded' }],
  [
    /^font-stretch-(.+)$/,
    ([, s]) => ({ 'font-stretch': h.bracket.cssvar.fraction.global(s) }),
    { autocomplete: 'font-stretch-<percentage>' },
  ],

  // family
  [
    /^font-(.+)$/,
    ([, d], { theme }) => {
      const v = theme.fontFamily?.[d] || h.bracket.cssvar.global(d)
      if (v && isFamilyType(v))
        return ({ 'font-family': v })

      return ({ 'font-weight': theme.fontWeight?.[d] || h.bracket.cssvar.global(d) })
    },
    { autocomplete: 'font-$fontFamily' },
  ],
]

export const tabSizes: Rule<Theme>[] = [
  [/^tab(?:-(.+))?$/, ([, s]) => {
    const v = h.bracket.cssvar.global.number(s || '4')
    if (v != null) {
      return {
        '-moz-tab-size': v,
        '-o-tab-size': v,
        'tab-size': v,
      }
    }
  }],
]

export const textIndents: Rule<Theme>[] = [
  [/^indent(?:-(.+))?$/, ([, s], { theme }) => ({ 'text-indent': theme.textIndent?.[s || 'DEFAULT'] || h.bracket.cssvar.global.fraction.rem(s) }), { autocomplete: 'indent-$textIndent' }],
]

export const textStrokes: Rule<Theme>[] = [
  // widths
  [/^text-stroke(?:-(.+))?$/, ([, s], { theme }) => ({ '-webkit-text-stroke-width': theme.textStrokeWidth?.[s || 'DEFAULT'] || h.bracket.cssvar.px(s) }), { autocomplete: 'text-stroke-$textStrokeWidth' }],

  // colors
  [/^text-stroke-(.+)$/, colorResolver('-webkit-text-stroke-color', 'text-stroke', 'borderColor'), { autocomplete: 'text-stroke-$colors' }],
  [/^text-stroke-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-text-stroke-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'text-stroke-(op|opacity)-<percent>' }],
]

export const textShadows: Rule<Theme>[] = [
  [/^text-shadow(?:-(.+))?$/, ([, s], { theme }) => {
    const v = theme.textShadow?.[s || 'DEFAULT']
    if (v != null) {
      return {
        '--un-text-shadow': colorableShadows(v, '--un-text-shadow-color').join(','),
        'text-shadow': 'var(--un-text-shadow)',
      }
    }
    return { 'text-shadow': h.bracket.cssvar.global(s) }
  }, { autocomplete: 'text-shadow-$textShadow' }],

  // colors
  [/^text-shadow-color-(.+)$/, colorResolver('--un-text-shadow-color', 'text-shadow', 'shadowColor'), { autocomplete: 'text-shadow-color-$colors' }],
  [/^text-shadow-color-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-text-shadow-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'text-shadow-color-(op|opacity)-<percent>' }],
]

function handleThemeByKey(s: string, theme: Theme, key: 'lineHeight' | 'letterSpacing') {
  return theme[key]?.[s] || h.bracket.cssvar.global.rem(s)
}

function handleSize([, s]: string[], { theme }: RuleContext<Theme>): CSSObject | undefined {
  const themed = toArray(theme.fontSize?.[s]) as [string, string | CSSObject]
  const size = themed?.[0] ?? h.bracket.cssvar.global.rem(s)
  if (size != null)
    return { 'font-size': size }
}

function handlerColorOrSize(match: RegExpMatchArray, ctx: RuleContext<Theme>): CSSObject | undefined {
  if (isCSSMathFn(h.bracket(match[1])))
    return handleSize(match, ctx)
  return colorResolver('color', 'text', 'textColor')(match, ctx) as CSSObject | undefined
}

function handleText([, s = 'base']: string[], { theme }: RuleContext<Theme>): CSSObject | undefined {
  const split = splitShorthand(s, 'length')
  if (!split)
    return

  const [size, leading] = split
  const sizePairs = toArray(theme.fontSize?.[size]) as [string, string | CSSObject, string?]
  const lineHeight = leading ? handleThemeByKey(leading, theme, 'lineHeight') : undefined

  if (sizePairs?.[0]) {
    const [fontSize, height, letterSpacing] = sizePairs
    if (typeof height === 'object') {
      return {
        'font-size': fontSize,
        ...height,
      }
    }
    return {
      'font-size': fontSize,
      'line-height': lineHeight ?? height ?? '1',
      'letter-spacing': letterSpacing ? handleThemeByKey(letterSpacing, theme, 'letterSpacing') : undefined,
    }
  }

  const fontSize = h.bracketOfLength.rem(size)
  if (lineHeight && fontSize) {
    return {
      'font-size': fontSize,
      'line-height': lineHeight,
    }
  }

  return { 'font-size': h.bracketOfLength.rem(s) }
}
