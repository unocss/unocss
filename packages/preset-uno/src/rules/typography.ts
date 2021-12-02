import { toArray, Rule } from '@unocss/core'
import { Theme } from '../theme'
import { handler as h } from '../utils'
import { CONTROL_BYPASS_PSEUDO } from '../variants/pseudo'
import { varEmpty } from './static'

export const fontsFamilies: Rule<Theme>[] = [
  [/^font-(\w+)$/, ([, d], { theme }) => {
    const font = theme.fontFamily?.[d]
    if (font) {
      return {
        'font-family': font,
      }
    }
  }],
]

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

export const fontSizes: Rule<Theme>[] = [
  [/^text-([^-]+)$/, ([, s = 'base'], { theme }) => {
    const result = toArray(theme.fontSize?.[s] || h.bracket.rem(s))
    if (result?.[0]) {
      const [size, height = '1'] = result
      return {
        'font-size': size,
        'line-height': height,
      }
    }
  }],
]

export const fontWeights: Rule[] = [
  [/^(?:font|fw)-?([^-]+)$/, ([, s]) => {
    const v = weightMap[s] || h.number(s)
    if (v)
      return { 'font-weight': v }
  }],
]

export const leadings: Rule<Theme>[] = [
  [/^(?:leading|lh)-([^-]+)$/, ([, s], { theme }) => {
    const v = theme.lineHeight?.[s] || h.bracket.rem(s)
    if (v !== null)
      return { 'line-height': v }
  }],
]

export const trackings: Rule<Theme>[] = [
  [/^tracking-([^-]+)$/, ([, s], { theme }) => {
    const v = theme.letterSpacing?.[s] || h.bracket.rem(s)
    if (v !== null)
      return { 'letter-spacing': v }
  }],
]

export const wordSpacings: Rule<Theme>[] = [
  [/^word-spacing-([^-]+)$/, ([, s], { theme }) => {
    const v = theme.wordSpacing?.[s] || h.bracket.rem(s)
    if (v !== null)
      return { 'word-spacing': v }
  }],
]

export const tabSizes: Rule<Theme>[] = [
  [/^tab-?([^-]*)$/, ([, s]) => {
    s = s || '4'
    const v = h.bracket.global.number(s)
    if (v !== null) {
      return {
        '-moz-tab-size': v,
        '-o-tab-size': v,
        'tab-size': v,
      }
    }
  }],
]

export const textDecorationLengths: Rule<Theme>[] = [
  [/^underline-([^-]+)$/, ([, s]) => {
    const v = s === 'auto' ? s : h.bracket.px(s)
    if (v != null)
      return { 'text-decoration-thickness': v }
  }],
]

export const textDecorationOffsets: Rule<Theme>[] = [
  [/^underline-offset-([^-]+)$/, ([, s]) => {
    const v = s === 'auto' ? s : h.bracket.px(s)
    if (v != null)
      return { 'text-underline-offset': v }
  }],
]

export const textIndents: Rule<Theme>[] = [
  [/^indent(?:-(.+))?$/, ([, s], { theme }) => {
    const v = theme.textIndent?.[s || 'DEFAULT'] || h.bracket.cssvar.fraction.rem(s)
    if (v != null)
      return { 'text-indent': v }
  }],
]

export const textStrokeWidths: Rule<Theme>[] = [
  [/^text-stroke(?:-(.+))?$/, ([, s], { theme }) => {
    const v = theme.textStrokeWidth?.[s || 'DEFAULT'] || h.bracket.cssvar.px(s)
    if (v != null)
      return { '-webkit-text-stroke-width': v }
  }],
]

export const textShadows: Rule<Theme>[] = [
  [/^text-shadow(?:-(.+))?$/, ([, s], { theme }) => {
    const v = theme.textShadow?.[s || 'DEFAULT'] || h.bracket.cssvar(s)
    if (v != null)
      return { 'text-shadow': v }
  }],
]

const fontVariantNumericBase = {
  '--un-ordinal': varEmpty,
  '--un-slashed-zero': varEmpty,
  '--un-numeric-figure': varEmpty,
  '--un-numeric-spacing': varEmpty,
  '--un-numeric-fraction': varEmpty,
  'font-variant-numeric': 'var(--un-ordinal) var(--un-slashed-zero) var(--un-numeric-figure) var(--un-numeric-spacing) var(--un-numeric-fraction)',
  [CONTROL_BYPASS_PSEUDO]: '',
}

export const fontVariantNumeric: Rule[] = [
  [/^ordinal$/, () => [fontVariantNumericBase, { '--un-ordinal': 'ordinal' }]],
  [/^slashed-zero$/, () => [fontVariantNumericBase, { '--un-slashed-zero': 'slashed-zero' }]],
  [/^lining-nums$/, () => [fontVariantNumericBase, { '--un-numeric-figure': 'lining-nums' }]],
  [/^oldstyle-nums$/, () => [fontVariantNumericBase, { '--un-numeric-figure': 'oldstyle-nums' }]],
  [/^proportional-nums$/, () => [fontVariantNumericBase, { '--un-numeric-spacing': 'proportional-nums' }]],
  [/^tabular-nums$/, () => [fontVariantNumericBase, { '--un-numeric-spacing': 'tabular-nums' }]],
  [/^diagonal-fractions$/, () => [fontVariantNumericBase, { '--un-numeric-fraction': 'diagonal-fractions' }]],
  [/^stacked-fractions$/, () => [fontVariantNumericBase, { '--un-numeric-fraction': 'stacked-fractions' }]],
  ['normal-nums', { 'font-variant-numeric': 'normal' }],
]

export const fonts = [
  fontsFamilies,
  fontSizes,
  fontWeights,
].flat(1)
