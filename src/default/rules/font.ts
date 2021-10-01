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

export const fontSizes: NanowindRule[] = [
  [/^(?:font|text)-([^-]+)$/, ([, s = 'base'], theme) => {
    const result = toArray(theme.fontSize[s] || h.bracket.size(s))
    if (result) {
      const [size, height = '1'] = result
      return {
        'font-size': size,
        'line-height': height,
      }
    }
  }],
]
