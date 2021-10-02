import { h } from '../../../handlers'
import { MiniwindRule } from '../../../types'
import { toArray } from '../../../utils'

export const fonts: MiniwindRule[] = [
  [/^font-(\w+)$/, ([, d], theme) => {
    const font = theme.fontFamily[d]
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

export const fontSizes: MiniwindRule[] = [
  [/^text-([^-]+)$/, ([, s = 'base'], theme) => {
    const result = toArray(theme.fontSize[s] || h.bracket.size(s))
    if (result?.[0]) {
      const [size, height = '1'] = result
      return {
        'font-size': size,
        'line-height': height,
      }
    }
  }],
]

export const fontWeights: MiniwindRule[] = [
  [/^font-([^-]+)$/, ([, s]) => {
    const v = weightMap[s] || h.number(s)
    if (v)
      return { 'font-weight': v }
  }],
]

export const leadings: MiniwindRule[] = [
  [/^leading-([^-]+)$/, ([, s], theme) => {
    const v = theme.lineHeight[s] || h.bracket.size(s)
    if (v !== null)
      return { 'line-height': v }
  }],
]

export const trackings: MiniwindRule[] = [
  [/^tracking-([^-]+)$/, ([, s], theme) => {
    const v = theme.letterSpacing[s] || h.bracket.size(s)
    if (v !== null)
      return { 'letter-spacing': v }
  }],
]
