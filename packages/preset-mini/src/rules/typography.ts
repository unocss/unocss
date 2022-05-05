import type { Rule } from '@unocss/core'
import { toArray } from '@unocss/core'
import type { Theme } from '../theme'
import { colorResolver, colorableShadows, handler as h } from '../utils'

const weightMap: Record<string, string> = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
  // int[0, 900] -> int
}

export const fonts: Rule<Theme>[] = [
  // family
  [
    /^font-(.+)$/,
    ([, d], { theme }) => ({ 'font-family': theme.fontFamily?.[d] || h.bracket.cssvar.global(d) }),
    { autocomplete: 'font-$fontFamily' },
  ],

  // size
  [
    /^text-(.+)$/,
    ([, s = 'base'], { theme }) => {
      const themed = toArray(theme.fontSize?.[s])
      if (themed?.[0]) {
        const [size, height = '1'] = themed
        return {
          'font-size': size,
          'line-height': height,
        }
      }

      return { 'font-size': h.bracketOfLength.rem(s) }
    },
    { autocomplete: 'text-$fontSize' },
  ],
  [/^text-size-(.+)$/, ([, s], { theme }) => {
    const themed = toArray(theme.fontSize?.[s])
    const size = themed?.[0] ?? h.bracket.cssvar.rem(s)
    if (size != null)
      return { 'font-size': size }
  }, { autocomplete: 'text-size-$fontSize' }],

  // weights
  [
    /^(?:font|fw)-?([^-]+)$/,
    ([, s]) => ({ 'font-weight': weightMap[s] || h.global.number(s) }),
    { autocomplete: `(font|fw)-(100|200|300|400|500|600|700|800|900|${Object.keys(weightMap).join('|')})` },
  ],

  // leadings
  [
    /^(?:font-)?(?:leading|lh)-(.+)$/,
    ([, s], { theme }) => ({ 'line-height': theme.lineHeight?.[s] || h.bracket.cssvar.global.rem(s) }),
    { autocomplete: '(leading|lh)-$lineHeight' },
  ],

  // synthesis
  [
    /^font-synthesis-(.+)$/,
    ([, s]) => ({ 'font-synthesis': s }),
    { autocomplete: 'font-synthesis-(none|weight|style|small-caps)' },
  ],

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
  [/^text-stroke-(.+)$/, colorResolver('-webkit-text-stroke-color', 'text-stroke'), { autocomplete: 'text-stroke-$colors' }],
  [/^text-stroke-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-text-stroke-opacity': h.bracket.percent(opacity) }), { autocomplete: 'text-stroke-(op|opacity)-<percent>' }],
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
    return { 'text-shadow': h.bracket.cssvar(s) }
  }, { autocomplete: 'text-shadow-$textShadow' }],

  // colors
  [/^text-shadow-color-(.+)$/, colorResolver('--un-text-shadow-color', 'text-shadow'), { autocomplete: 'text-shadow-color-$colors' }],
  [/^text-shadow-color-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-text-shadow-opacity': h.bracket.percent(opacity) }), { autocomplete: 'text-shadow-color-(op|opacity)-<percent>' }],
]
