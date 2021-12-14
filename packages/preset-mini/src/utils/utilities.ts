import type { CSSEntries } from '@unocss/core'
import { handler as h } from './handlers'
import { directionMap } from './mappings'

export function capitalize<T extends string>(str: T) {
  return str.charAt(0).toUpperCase() + str.slice(1) as Capitalize<T>
}

export const directionSize = (prefix: string) => ([_, direction, size]: string[]): CSSEntries | undefined => {
  const v = h.bracket.rem.fraction.cssvar(size)
  if (v)
    return directionMap[direction].map(i => [prefix + i, v])
}
