import type { CSSEntry } from '@unocss/core'

export function createRemToPxResolver(base: number = 16) {
  return (utility: CSSEntry) => {
    const remRE = /(-?[.\d]+)rem/g
    if (typeof utility[1] === 'string' && remRE.test(utility[1]))
      utility[1] = utility[1].replace(remRE, (_, p1) => `${p1 * base}px`)
  }
}
