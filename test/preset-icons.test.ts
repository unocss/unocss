import { createGenerator, presetUno } from 'unocss'
import presetIcons from '@unocss/preset-icons'

describe('attributify', () => {
  const fixture1 = `
<button class="i-carbon-sun dark:i-carbon-moon" />
`

  const uno = createGenerator({
    presets: [
      presetIcons(),
      presetUno(),
    ],
  })

  test('fixture1', async() => {
    const { css, layers } = await uno.generate(fixture1)
    expect(layers).toEqual(['icons', 'default'])
    expect(css).toMatchSnapshot()
  })
})
