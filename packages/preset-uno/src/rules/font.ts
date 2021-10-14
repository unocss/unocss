import { handler as h, toArray, Rule } from '@unocss/core'

export const fonts: Rule[] = [
  [/^font-(\w+)$/, ([, d], theme) => {
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

export const fontSizes: Rule[] = [
  [/^text-([^-]+)$/, ([, s = 'base'], theme) => {
    const result = toArray(theme.fontSize?.[s] || h.bracket.size(s))
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

export const leadings: Rule[] = [
  [/^(?:leading|lh)-([^-]+)$/, ([, s], theme) => {
    const v = theme.lineHeight?.[s] || h.bracket.size(s)
    if (v !== null)
      return { 'line-height': v }
  }],
]

export const trackings: Rule[] = [
  [/^tracking-([^-]+)$/, ([, s], theme) => {
    const v = theme.letterSpacing?.[s] || h.bracket.size(s)
    if (v !== null)
      return { 'letter-spacing': v }
  }],
]
