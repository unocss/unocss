import { escapeSelector } from '@unocss/core'
import { describe, expect, it } from 'vitest'
import { generate } from './utils/wind4-tailwind4'

export const orderContracts: [family: string, candidates: string[]][] = [
  ['group-hover group-focus sorting', ['group-focus:flex', 'group-hover:flex']],
  ['sorting stacked min-* and max-* variants', ['min-[700px]:max-[900px]:flex', 'min-[500px]:max-[800px]:flex']],
  ['stacked min-* and max-* variants should come after unprefixed variants', ['min-[500px]:max-[900px]:flex', 'sm:flex', 'flex']],
  ['min, max and unprefixed breakpoints', ['min-[500px]:flex', 'max-[900px]:flex', 'sm:flex']],
  ['sorting `min` and `max` should sort by unit, then by value, then alphabetically', ['min-[50rem]:flex', 'min-[500px]:flex', 'min-[40rem]:flex']],
  ['variant order', ['disabled:flex', 'focus:flex', 'active:flex', 'flex']],
  ['variants with the same root are sorted deterministically', ['data-[state=open]:flex', 'data-[state=closed]:flex']],
  ['move modifier of compound variant to sub-variant if its also a compound variant', ['group-has-checked/menu:flex', 'group-has-focus/menu:flex']],
]

describe.each(orderContracts)('variant ordering: %s', (_family, candidates) => {
  for (const engine of ['tailwind', 'wind'] as const) {
    const gap = engine === 'wind' && _family === 'sorting `min` and `max` should sort by unit, then by value, then alphabetically'
    it.skipIf(gap)(`${engine}: ${gap ? 'mixed-unit breakpoint ordering differs' : 'candidate order is independent of input order'}`, async () => {
      const forward = await generate(candidates)
      const reversed = await generate([...candidates].reverse())
      const orders: string[][] = []
      for (const root of [forward.tailwind, forward[engine], reversed[engine]]) {
        const css = root.toString()
        const positions = candidates.map(candidate => ({ candidate, index: css.indexOf(`.${escapeSelector(candidate)}`) }))
        for (const position of positions)
          expect(position.index, position.candidate).toBeGreaterThanOrEqual(0)
        orders.push(positions.sort((a, b) => a.index - b.index).map(item => item.candidate))
      }
      expect(orders[1]).toEqual(orders[0])
      expect(orders[2]).toEqual(orders[0])
    })
  }
})
