import { toArray, Rule } from '@unocss/core'
import { Theme } from '../theme'
import { handler as h } from '../utils'

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

export const tabSizes: Rule<Theme>[] = [
  [/^tab-?([^-]*)$/, ([, s]) => {
    const v = h.bracket.number.rem(s) || 4
    return {
      '-moz-tab-size': v,
      '-o-tab-size': v,
      'tab-size': v,
    }
  }],
]

export const textDecorationLengths: Rule<Theme>[] = [
  [/^underline-([^-]+)$/, ([, s]) => {
    const v = h.bracket.number.rem(s)
    if (v != null)
      return { 'text-decoration-thickness': v }
  }],
]

export const textDecorationOffsets: Rule<Theme>[] = [
  [/^underline-offset-([^-]+)$/, ([, s]) => {
    const v = h.bracket.number.rem(s)
    if (v != null)
      return { 'text-underline-offset': v }
  }],
]

export const textIndents: Rule<Theme>[] = [
  [/^indent-?([^-]*)$/, ([, s], { theme }) => {
    const v = theme.textIndent?.[s || 'DEFAULT'] || h.bracket.fraction.rem(s)
    if (v != null)
      return { 'text-indent': v }
  }],
]

export const textStrokeWidths: Rule<Theme>[] = [
  [/^text-stroke-?([^-]*)$/, ([, s], { theme }) => {
    const v = theme.textStrokeWidth?.[s || 'DEFAULT'] || h.bracket.px(s)
    if (v != null)
      return { '-webkit-text-stroke-width': v }
  }],
]

export const fonts = [
  fontsFamilies,
  fontSizes,
  fontWeights,
].flat(1)
