import { h } from '../../handlers'
import { NanowindRule } from '../../types'

export const borders: NanowindRule[] = [
  [/^border(?:-(\w+))?$/, ([, s = '1']) => ({ 'border-width': h.border(s) })],
]
