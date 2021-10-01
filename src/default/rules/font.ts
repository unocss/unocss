import { h } from '../../handlers'
import { NanowindRule } from '../../types'
import { toArray } from '../../utils'

export const fonts: NanowindRule[] = [
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

export const fontSizes: NanowindRule[] = [
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

export const fontWeights: NanowindRule[] = [
  [/^font-([^-]+)$/, ([, s]) => {
    const v = weightMap[s] || h.number(s)
    if (v)
      return { 'font-weight': v }
  }],
]
