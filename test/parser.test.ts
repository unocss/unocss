import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { expect, it } from 'vitest'

it('split string with custom separator', async () => {
  const uno = createGenerator({
    presets: [
      presetUno(),
    ],
    separators: ['__'],
  })

  const { css } = await uno.generate('backdrop__shadow-green', { preflights: false })
  expect(css).toMatchSnapshot()
})

it('unable to generate token variant with explicit separator without dash', async () => {
  const uno = createGenerator({
    presets: [
      presetUno(),
    ],
    separators: '-',
  })

  const { css } = await uno.generate('backdrop-shadow-green', { preflights: false })
  expect(css).eql('')
})
