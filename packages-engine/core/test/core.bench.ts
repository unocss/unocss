import { createGenerator, resolveConfig } from '@unocss/core'
import { bench, describe } from 'vitest'
import {
  customRuleProfile,
  customRuleToken,
  defaultProfile,
  extractionSource,
  variantProfile,
  variantToken,
  workloads,
} from './performance-fixtures'

const defaultGenerator = await createGenerator(defaultProfile)
const variantGenerator = await createGenerator(variantProfile)
await defaultGenerator.parseToken('matched-1')

describe('configuration resolution', () => {
  bench('default profile', async () => {
    void (await resolveConfig(defaultProfile)).rulesSize
  })

  bench('variant-heavy profile', async () => {
    void (await resolveConfig(variantProfile)).rulesSize
  })

  bench('custom-rule profile', async () => {
    void (await resolveConfig(customRuleProfile)).rulesSize
  })
})

describe('extraction', () => {
  bench('typical workload', async () => {
    void (await defaultGenerator.applyExtractors(extractionSource)).size
  })
})

describe('token parsing', () => {
  bench('cold generator and default token', async () => {
    const generator = await createGenerator(defaultProfile)
    void (await generator.parseToken('matched-1'))?.length
  })

  bench('warm default token', async () => {
    void (await defaultGenerator.parseToken('matched-1'))?.length
  })

  bench('variant-heavy token', async () => {
    const generator = await createGenerator(variantProfile)
    void (await generator.parseToken(variantToken))?.length
  })

  bench('custom-rule token', async () => {
    const generator = await createGenerator(customRuleProfile)
    void (await generator.parseToken(customRuleToken))?.length
  })
})

describe('variant matching', () => {
  bench('variant-heavy token', async () => {
    void (await variantGenerator.matchVariants(variantToken)).length
  })
})

describe('generation', () => {
  for (const [name, tokens] of Object.entries(workloads)) {
    bench(`default profile, ${name} workload`, async () => {
      const generator = await createGenerator(defaultProfile)
      const result = await generator.generate(tokens, { preflights: false, safelist: false })
      void result.matched.size
    })

    bench(`variant-heavy profile, ${name} workload`, async () => {
      const generator = await createGenerator(variantProfile)
      const result = await generator.generate(
        tokens.map(token => token.startsWith('matched-') ? `hover:${token}` : token),
        { preflights: false, safelist: false },
      )
      void result.matched.size
    })

    bench(`custom-rule profile, ${name} workload`, async () => {
      const generator = await createGenerator(customRuleProfile)
      const result = await generator.generate(
        tokens.map(token => token.startsWith('matched-') ? token.replace('matched-', 'value-') : token),
        { preflights: false, safelist: false },
      )
      void result.matched.size
    })
  }
})

describe('generation with css serialization', () => {
  for (const [name, tokens] of Object.entries(workloads)) {
    bench(name, async () => {
      const generator = await createGenerator(defaultProfile)
      const result = await generator.generate(tokens, { safelist: false })
      void result.css.length
    })
  }
})
