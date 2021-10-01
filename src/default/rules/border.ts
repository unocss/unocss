import { cornerMap, NanowindTheme } from '../..'
import { h } from '../../handlers'
import { NanowindCssEntries, NanowindRule } from '../../types'

export const borders: NanowindRule[] = [
  [/^border(?:-([^-]+))?$/, ([, s = '1']) => ({ 'border-width': h.border(s) })],
]

function handlerRounded([, a, b]: string[], theme: NanowindTheme): NanowindCssEntries | undefined {
  const [d, s = 'DEFAULT'] = cornerMap[a] ? [a, b] : ['', a]
  const v = theme.borderRadius[s] || h.bracket.fraction.size(s)
  if (v != null)
    return cornerMap[d].map(i => [`border${i}-radius`, v])
}

export const rounded: NanowindRule[] = [
  [/^rounded$/, handlerRounded],
  [/^rounded(?:-([^-]+))?$/, handlerRounded],
  [/^rounded(?:-([^-]+))?(?:-([^-]+))?$/, handlerRounded],
]
