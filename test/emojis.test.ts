import { createGenerator } from '@unocss/core'
import presetAttributify from '@unocss/preset-attributify'
import { describe, expect, test } from 'vitest'

describe('emojis', () => {
  const fixture1 = `
    <button 
    🦉 class="🦉" 🦉="1" 🥝-2 type="button"
    >
    Button
    </button>
  `
  const uno = createGenerator({
    presets: [
      presetAttributify({ strict: true }),
    ],
    rules: [
      ['🦉', {
        color: 'red',
      }],
    ],
  })

  test('extractor1', async () => {
    expect(await uno.applyExtractors(fixture1)).toMatchSnapshot()
  })

  test('fixture1', async () => {
    const { css } = await uno.generate(fixture1, { preflights: false })
    expect(css).toMatchSnapshot()
  })
})
