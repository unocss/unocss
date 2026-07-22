import { expect, it } from 'vitest'
import { rules as rulesMini } from '../packages-presets/preset-mini/src/_rules/default'
import { rules as rulesWind } from '../packages-presets/preset-wind3/src/rules/default'

it('should rules in preset-wind should have same order as preset-mini', () => {
  let lastFoundIndex = -1
  let diff = 0

  for (const [i, rule] of rulesMini.entries()) {
    const rulePattern = typeof rule[0] === 'string' ? rule[0] : rule[0].toString()

    const indexWind = rulesWind.findIndex((r, idx) => {
      if (idx <= lastFoundIndex)
        return false
      const windPattern = typeof r[0] === 'string' ? r[0] : r[0].toString()
      return windPattern === rulePattern
    })

    expect(indexWind, `rule ${rule[0]} not found in wind after index ${lastFoundIndex}`).toBeGreaterThan(lastFoundIndex)

    expect(
      i + diff,
      `rule ${rule[0]} is not in the same order as preset`,
    ).toBeLessThanOrEqual(indexWind)

    diff = indexWind - i
    lastFoundIndex = indexWind
  }
})
