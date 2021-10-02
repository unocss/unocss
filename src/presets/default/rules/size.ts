import { h } from '../../../utils'
import { MiniwindRule } from '../../../types'

export const sizes: MiniwindRule[] = [
  [/^w-([^-]+)$/, ([, s]) => ({ width: h.bracket.fraction.size(s) })],
  [/^h-([^-]+)$/, ([, s]) => ({ height: h.bracket.fraction.size(s) })],
  [/^max-w-([^-]+)$/, ([, s]) => ({ 'max-width': h.bracket.fraction.size(s) })],
  [/^max-h-([^-]+)$/, ([, s]) => ({ 'max-height': h.bracket.fraction.size(s) })],
]
