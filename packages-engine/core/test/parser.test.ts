import { createGenerator } from '@unocss/core'
import presetWind3 from '@unocss/preset-wind3'
import { expect, it } from 'vitest'

it('split string with custom separator', async () => {
  const uno = await createGenerator({
    presets: [
      presetWind3(),
    ],
    separators: ['__'],
  })

  const { css } = await uno.generate('backdrop__shadow-green', { preflights: false })
  expect(css).toMatchSnapshot()
})

it('unable to generate token variant with explicit separator without dash', async () => {
  const uno = await createGenerator({
    presets: [
      presetWind3(),
    ],
    separators: '-',
  })

  const { css } = await uno.generate('backdrop-shadow-green', { preflights: false })
  expect(css).eql('')
})
