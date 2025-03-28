import type { CSSEntry } from '@unocss/core'
import { remRE } from './handlers/regex'

export function createRemToPxResolver(base: number = 16) {
  return (utility: CSSEntry) => {
    if (typeof utility[1] === 'string' && remRE.test(utility[1]))
      utility[1] = utility[1].replace(remRE, (_, p1) => `${p1 * base}px`)
  }
}
