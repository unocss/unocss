import { createGenerator, resolveConfig } from '@unocss/core'
import { it } from 'vitest'
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

it('configuration resolution', async ({ bench }) => {
  await bench('default profile', async () => {
    void (await resolveConfig(defaultProfile)).rulesSize
  }).run()

  await bench('variant-heavy profile', async () => {
    void (await resolveConfig(variantProfile)).rulesSize
  }).run()

  await bench('custom-rule profile', async () => {
    void (await resolveConfig(customRuleProfile)).rulesSize
  }).run()
})

it('extraction', async ({ bench }) => {
  await bench('typical workload', async () => {
    void (await defaultGenerator.applyExtractors(extractionSource)).size
  }).run()
})

it('token parsing', async ({ bench }) => {
  await bench('cold generator and default token', async () => {
    const generator = await createGenerator(defaultProfile)
    void (await generator.parseToken('matched-1'))?.length
  }).run()

  await bench('warm default token', async () => {
    void (await defaultGenerator.parseToken('matched-1'))?.length
  }).run()

  await bench('variant-heavy token', async () => {
    const generator = await createGenerator(variantProfile)
    void (await generator.parseToken(variantToken))?.length
  }).run()

  await bench('custom-rule token', async () => {
    const generator = await createGenerator(customRuleProfile)
    void (await generator.parseToken(customRuleToken))?.length
  }).run()
})

it('variant matching', async ({ bench }) => {
  await bench('variant-heavy token', async () => {
    void (await variantGenerator.matchVariants(variantToken)).length
  }).run()
})

it('generation', async ({ bench }) => {
  for (const [name, tokens] of Object.entries(workloads)) {
    await bench(`default profile, ${name} workload`, async () => {
      const generator = await createGenerator(defaultProfile)
      const result = await generator.generate(tokens, { preflights: false, safelist: false })
      void result.matched.size
    }).run()

    await bench(`variant-heavy profile, ${name} workload`, async () => {
      const generator = await createGenerator(variantProfile)
      const result = await generator.generate(
        tokens.map(token => token.startsWith('matched-') ? `hover:${token}` : token),
        { preflights: false, safelist: false },
      )
      void result.matched.size
    }).run()

    await bench(`custom-rule profile, ${name} workload`, async () => {
      const generator = await createGenerator(customRuleProfile)
      const result = await generator.generate(
        tokens.map(token => token.startsWith('matched-') ? token.replace('matched-', 'value-') : token),
        { preflights: false, safelist: false },
      )
      void result.matched.size
    }).run()
  }
})

it('generation with css serialization', async ({ bench }) => {
  for (const [name, tokens] of Object.entries(workloads)) {
    await bench(name, async () => {
      const generator = await createGenerator(defaultProfile)
      const result = await generator.generate(tokens, { safelist: false })
      void result.css.length
    }).run()
  }
})
