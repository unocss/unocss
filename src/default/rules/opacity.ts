import { NanowindRule } from '../../types'

export const opacity: NanowindRule[] = [
  [/^op(?:acity)?-(\d+)$/, ([, d]) => ({ opacity: parseFloat(d) / 100 })],
]
