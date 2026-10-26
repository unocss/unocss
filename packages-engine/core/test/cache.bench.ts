import { createGenerator } from '@unocss/core'
import { it } from 'vitest'

it('token cache queries', async ({ bench }) => {
  const uno = await createGenerator({
    rules: [[/^u-(\d+)$/, ([, index]) => ({ order: String(Number(index) % 100) })]],
  })
  const tokens = Array.from({ length: 40_000 }, (_, index) => index % 2 ? `miss-${index}` : `u-${index}`)
  await uno.generate(tokens)

  await bench('prefix lookup with 40k cached tokens', () => {
    return uno.getCachedTokens('u-12').length
  }).run()

  await bench('alias lookup with 40k cached tokens', () => {
    return uno.getCachedAliases('u-2')?.length
  }).run()
})
