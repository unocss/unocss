import { createGenerator } from '@unocss/core'
import { bench, describe } from 'vitest'

const tokens = Array.from({ length: 24_000 }, (_, index) => `candidate-${index}`)
tokens.splice(0, 1_800, ...Array.from({ length: 1_800 }, (_, index) => `matched-${index}`))

describe('generate large token sets', async () => {
  const uno = await createGenerator({
    rules: [
      [/^matched-(\d+)$/, ([, index]) => ({ order: index })],
    ],
  })

  bench('mostly unmatched tokens', async () => {
    uno.resetTokenProcessing()
    await uno.generate(tokens, { preflights: false })
  })
})
