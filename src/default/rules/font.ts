import { NanowindRule } from '../../types'

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
