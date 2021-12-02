import { createGenerator } from '@unocss/core'
import presetAttributify from '@unocss/preset-attributify'

describe('emojis', () => {
  const fixture1 = `
    <button 
    🦉 class="🦉" 🦉="1" 🥝-2
    >
    Button
    </button>
  `
  const uno = createGenerator({
    presets: [
      presetAttributify({ strict: true }),
    ],
  })

  test('extractor1', async() => {
    expect(await uno.applyExtractors(fixture1)).toMatchSnapshot()
  })

  test('fixture1', async() => {
    const { css } = await uno.generate(fixture1)
    expect(css).toMatchSnapshot()
  })
})
