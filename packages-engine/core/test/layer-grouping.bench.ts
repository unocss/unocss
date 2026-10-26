import { createGenerator, symbols } from '@unocss/core'
import { it } from 'vitest'

it('generate CSS across layers', async ({ bench }) => {
  const tokens = Array.from({ length: 6_000 }, (_, index) => `u-${index}`)
  for (const count of [1, 12]) {
    const uno = await createGenerator({
      rules: [[/^u-(\d+)$/, ([, value]) => ({
        '--value': value,
        [symbols.layer]: `layer${Number(value) % count}`,
        [symbols.parent]: [`@media (min-width:${Number(value) % 40}px)`, Number(value) % 40],
      })]],
    })
    await uno.generate(tokens)

    await bench(`warm generation with ${count} populated layers`, async () => {
      return (await uno.generate(tokens)).css.length
    }).run()

    if (count === 12) {
      await bench('cold generation with 12 populated layers', async () => {
        uno.resetTokenProcessing()
        return (await uno.generate(tokens)).css.length
      }).run()
    }
  }
})
