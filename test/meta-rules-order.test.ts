import { expect, it } from 'vitest'
import { rules as rulesMini } from '../packages-presets/preset-mini/src/_rules/default'
import { rules as rulesWind } from '../packages-presets/preset-wind3/src/rules/default'

it('should rules in preset-wind should have same order as preset-mini', () => {
  let diff = 0
  for (const rule of rulesMini) {
    const indexMini = rulesMini.indexOf(rule)
    const indexWind = rulesWind.indexOf(rule)
    expect(indexMini).toBeGreaterThanOrEqual(0)
    expect(indexWind).toBeGreaterThanOrEqual(0)
    expect(
      indexMini + diff,
      `rule ${rule[0]} is not in the same order as preset`,
    ).toBeLessThanOrEqual(indexWind)
    diff = indexWind - indexMini
  }
})
