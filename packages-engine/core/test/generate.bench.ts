import { createGenerator } from '@unocss/core'
import { it } from 'vitest'

const tokens = Array.from({ length: 24_000 }, (_, index) => `candidate-${index}`)
tokens.splice(0, 1_800, ...Array.from({ length: 1_800 }, (_, index) => `matched-${index}`))

it('generate large token sets', async ({ bench }) => {
  const uno = await createGenerator({
    rules: [
      [/^matched-(\d+)$/, ([, index]) => ({ order: index })],
    ],
  })

  await bench('mostly unmatched tokens', async () => {
    uno.resetTokenProcessing()
    await uno.generate(tokens, { preflights: false })
  }).run()
})
