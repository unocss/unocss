import type { CSSObject, CSSValueInput, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { colorableShadows, colorResolver, defineProperty, getStringComponent, globalKeywords, h, isCSSMathFn, numberResolver } from '../utils'
import { bracketTypeRe } from '../utils/handlers/regex'
import { generateThemeVariable, themeTracking } from '../utils/track'

export const fonts: Rule<Theme>[] = [
  // text
  [/^text-(.+)$/, handleText, { autocomplete: 'text-$text' }],

  // // text size
  [/^(?:text|font)-size-(.+)$/, handleSize, { autocomplete: 'text-size-$text' }],

  // text colors
  [/^text-(?:color-)?(.+)$/, handlerColorOrSize, { autocomplete: 'text-$colors' }],

  // colors
  [/^(?:color|c)-(.+)$/, colorResolver('color', 'text')],

  // style
  [/^(?:text|color|c)-(.+)$/, ([, v]) => globalKeywords.includes(v) ? { color: v } : undefined, { autocomplete: `(text|color|c)-(${globalKeywords.join('|')})` }],

  // opacity
  [/^(?:text|color|c)-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-text-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: '(text|color|c)-(op|opacity)-<percent>' }],

  // weights
  [
    /^fw-?([^-]+)$/,
    ([, s], { theme }) => {
      let v: string | undefined

      if (theme.fontWeight?.[s]) {
        themeTracking(`fontWeight`, s)
        v = generateThemeVariable('fontWeight', s)
      }
      else {
        v = h.bracket.cssvar.global.number(s)
      }

      return {
        '--un-font-weight': v,
        'font-weight': v,
      }
    },
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
    ([, s], { theme }) => {
      let v: string | undefined

      if (theme.leading?.[s]) {
        themeTracking('leading', s)
        v = generateThemeVariable('leading', s)
      }
      else if (numberResolver(s)) {
        themeTracking('spacing')
        v = `calc(var(--spacing) * ${numberResolver(s)})`
      }
      else {
        v = h.bracket.cssvar.global.rem(s)
      }

      if (v != null) {
        return [
          {
            '--un-leading': v,
            'line-height': v,
          },
          defineProperty('--un-leading'),
        ]
      }
    },
    { autocomplete: '(leading|lh|line-height)-$leading' },
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
    ([, s], { theme }) => {
      let v: string | undefined

      if (theme.tracking?.[s]) {
        themeTracking(`tracking`, s)
        v = generateThemeVariable('tracking', s)
      }
      else {
        v = h.bracket.cssvar.global.rem(s)
      }

      return {
        '--un-tracking': v,
        'letter-spacing': v,
      }
    },
    { autocomplete: 'tracking-$tracking' },
  ],

  // word-spacing
  [
    /^(?:font-)?word-spacing-(.+)$/,
    ([, s], { theme }) => {
      // Use the same variable as tracking
      const v = theme.tracking?.[s] ? generateThemeVariable('tracking', s) : h.bracket.cssvar.global.rem(s)
      return {
        '--un-word-spacing': v,
        'word-spacing': v,
      }
    },
    { autocomplete: 'word-spacing-$spacing' },
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

  // family & weight
  [
    /^font-(.+)$/,
    ([, d], { theme }) => {
      let v: string | undefined

      // Prefer theme font family
      if (theme.font?.[d]) {
        themeTracking('font', d)
        v = generateThemeVariable('font', d)
        return { 'font-family': v }
      }

      // Prefer theme font weight
      if (theme.fontWeight?.[d]) {
        themeTracking('fontWeight', d)
        v = generateThemeVariable('fontWeight', d)
        return { '--un-font-weight': v, 'font-weight': v }
      }

      // Numeric font weight (e.g. font-700)
      v = h.number(d)
      if (v != null) {
        return { '--un-font-weight': v, 'font-weight': v }
      }

      // Bracketed font family (e.g. font-[family:Inter])
      v = h.bracketOfFamily(d)
      if (v != null && h.number(v) == null) {
        v = h.cssvar(v) ?? v
        return { 'font-family': v }
      }

      // Bracketed numeric font weight (e.g. font-[number:700])
      v = h.bracketOfNumber(d)
      if (v != null) {
        v = h.cssvar.number(v)
        return { '--un-font-weight': v, 'font-weight': v }
      }

      // Bracketed value that is a unknown (e.g. font-[sth])
      v = h.bracket(d)
      if (v != null && h.number(v) != null) {
        const num = h.number(v)
        return { '--un-font-weight': num, 'font-weight': num }
      }

      v = h.bracket.cssvar.global(d)
      if (v != null) {
        return { 'font-family': v }
      }
    },
    { autocomplete: ['font-$font', 'font-$fontWeight'] },
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
  [/^indent-(.+)$/, ([, s]) => {
    let v: string | number | undefined = numberResolver(s)

    if (v != null) {
      themeTracking(`spacing`)
      return { 'text-indent': `calc(var(--spacing) * ${v})` }
    }

    v = h.bracket.cssvar.auto.global.rem(s)

    if (v != null) {
      return { 'text-indent': v }
    }
  }],
]

export const textStrokes: Rule<Theme>[] = [
  // widths
  [/^text-stroke(?:-(.+))?$/, ([, s = 'DEFAULT'], { theme }) => {
    if (theme.textStrokeWidth?.[s]) {
      themeTracking(`textStrokeWidth`, s)
    }
    return {
      '-webkit-text-stroke-width': theme.textStrokeWidth?.[s]
        ? generateThemeVariable('textStrokeWidth', s)
        : h.bracket.cssvar.px(s),
    }
  }, { autocomplete: 'text-stroke-$textStrokeWidth' }],

  // colors
  [/^text-stroke-(.+)$/, colorResolver('-webkit-text-stroke-color', 'text-stroke'), { autocomplete: 'text-stroke-$colors' }],
  [/^text-stroke-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-text-stroke-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'text-stroke-(op|opacity)-<percent>' }],
]

const opRE = /op(?:acity)?-/
export const textShadows: Rule<Theme>[] = [
  [/^text-shadow(?:-(.+))?$/, (match, ctx) => {
    const [_, s = 'DEFAULT'] = match
    const v = ctx.theme.textShadow?.[s]
    if (v != null) {
      return {
        '--un-text-shadow': colorableShadows(v, '--un-text-shadow-color').join(','),
        'text-shadow': 'var(--un-text-shadow)',
      }
    }
    if (opRE.test(s))
      return { '--un-text-shadow-opacity': h.bracket.percent.cssvar(s.replace(opRE, '')) }

    return colorResolver('--un-text-shadow-color', 'text-shadow')(match, ctx) ?? { 'text-shadow': h.bracket.cssvar.global(s) }
  }, {
    autocomplete: [
      'text-shadow-$textShadow',
      'text-shadow(-color)?-$colors',
      'text-shadow(-color)?-(op|opacity)-<percent>',
    ],
  }],

  // colors
  [/^text-shadow-color-(.+)$/, colorResolver('--un-text-shadow-color', 'text-shadow'), { autocomplete: 'text-shadow-color-$colors' }],
  [/^text-shadow-color-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-text-shadow-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'text-shadow-color-(op|opacity)-<percent>' }],
]

const fontVariantNumericProperties = [
  defineProperty('--un-ordinal'),
  defineProperty('--un-slashed-zero'),
  defineProperty('--un-numeric-figure'),
  defineProperty('--un-numeric-spacing'),
  defineProperty('--un-numeric-fraction'),
]
const baseFontVariantNumeric = {
  'font-variant-numeric': 'var(--un-ordinal,) var(--un-slashed-zero,) var(--un-numeric-figure,) var(--un-numeric-spacing,) var(--un-numeric-fraction,)',
}

export const fontVariantNumeric: Rule<Theme>[] = [
  ['ordinal', [{ '--un-ordinal': 'ordinal', ...baseFontVariantNumeric }, ...fontVariantNumericProperties]],
  ['slashed-zero', [{ '--un-slashed-zero': 'slashed-zero', ...baseFontVariantNumeric }, ...fontVariantNumericProperties]],
  ['lining-nums', [{ '--un-numeric-figure': 'lining-nums', ...baseFontVariantNumeric }, ...fontVariantNumericProperties]],
  ['oldstyle-nums', [{ '--un-numeric-figure': 'oldstyle-nums', ...baseFontVariantNumeric }, ...fontVariantNumericProperties]],
  ['proportional-nums', [{ '--un-numeric-spacing': 'proportional-nums', ...baseFontVariantNumeric }, ...fontVariantNumericProperties]],
  ['tabular-nums', [{ '--un-numeric-spacing': 'tabular-nums', ...baseFontVariantNumeric }, ...fontVariantNumericProperties]],
  ['diagonal-fractions', [{ '--un-numeric-fraction': 'diagonal-fractions', ...baseFontVariantNumeric }, ...fontVariantNumericProperties]],
  ['stacked-fractions', [{ '--un-numeric-fraction': 'stacked-fractions', ...baseFontVariantNumeric }, ...fontVariantNumericProperties]],
  ['normal-nums', [{ 'font-variant-numeric': 'normal' }]],
]

function handleText([, s = 'base']: string[], { theme }: RuleContext<Theme>): CSSObject | undefined {
  const split = splitShorthand(s, 'length')
  if (!split)
    return

  const [size, leading] = split

  const sizePairs = theme.text?.[size]
  let lineHeight

  if (leading) {
    if (theme.leading?.[leading]) {
      themeTracking(`leading`, leading)
      lineHeight = generateThemeVariable('leading', leading)
    }
    else {
      lineHeight = h.bracket.cssvar.global.rem(leading)
    }
  }

  if (sizePairs) {
    themeTracking(`text`, [size, 'fontSize'])
    themeTracking(`text`, [size, 'lineHeight'])
    if (sizePairs.letterSpacing) {
      themeTracking(`text`, [size, 'letterSpacing'])
    }

    return {
      'font-size': generateThemeVariable('text', [size, 'fontSize']),
      'line-height': lineHeight ?? `var(--un-leading, ${generateThemeVariable('text', [size, 'lineHeight'])})`,
      'letter-spacing': sizePairs.letterSpacing ? generateThemeVariable('text', [size, 'letterSpacing']) : undefined,
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

function handleSize([, s]: string[], { theme }: RuleContext<Theme>): CSSObject | undefined {
  if (theme.text?.[s] != null) {
    themeTracking(`text`, [s, 'fontSize'])
    themeTracking(`text`, [s, 'lineHeight'])
    return {
      'font-size': generateThemeVariable('text', [s, 'fontSize']),
      'line-height': `var(--un-leading, ${generateThemeVariable('text', [s, 'lineHeight'])})`,
    }
  }
  else {
    const d = h.bracket.cssvar.global.rem(s)
    if (d)
      return { 'font-size': d }
  }
}

function handlerColorOrSize(match: RegExpMatchArray, ctx: RuleContext<Theme>): CSSObject | (CSSValueInput | string)[] | undefined {
  if (isCSSMathFn(h.bracket(match[1])))
    return handleSize(match, ctx)
  return colorResolver('color', 'text')(match, ctx)
}

export function splitShorthand(body: string, type: string) {
  const [front, rest] = getStringComponent(body, '[', ']', ['/', ':']) ?? []

  if (front != null) {
    const match = (front.match(bracketTypeRe) ?? [])[1]

    if (match == null || match === type)
      return [front, rest]
  }
}
