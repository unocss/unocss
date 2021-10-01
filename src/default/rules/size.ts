import { h } from '../../handlers'
import { NanowindRule } from '../../types'

export const sizes: NanowindRule[] = [
  [/^w-([^-]+)$/, ([, s]) => ({ width: h.bracket.fraction.size(s) })],
  [/^h-([^-]+)$/, ([, s]) => ({ height: h.bracket.fraction.size(s) })],
  [/^max-w-([^-]+)$/, ([, s]) => ({ 'max-width': h.bracket.fraction.size(s) })],
  [/^max-h-([^-]+)$/, ([, s]) => ({ 'max-height': h.bracket.fraction.size(s) })],
]
