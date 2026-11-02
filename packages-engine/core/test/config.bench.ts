import type { DynamicRule } from '@unocss/core'
import { resolveConfig } from '@unocss/core'
import { it } from 'vitest'

it('resolve dynamic rules', async ({ bench }) => {
  for (const count of [500, 5_000]) {
    const rules: DynamicRule[] = Array.from({ length: count }, (_, index) => [
      new RegExp(`^r${index}-(\\d+)$`),
      ([, value]) => ({ order: value }),
    ])

    await bench(`resolve config with ${count} dynamic rules`, async () => {
      return (await resolveConfig({ rules })).rulesDynamic.length
    }).run()
  }
})
