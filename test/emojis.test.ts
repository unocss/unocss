import { createGenerator } from '@unocss/core'
import presetAttributify from '@unocss/preset-attributify'
import { describe, expect, it } from 'vitest'

describe('emojis', async () => {
  const fixture1 = `
    <button 
    🦉 class="🦉" 🦉="1" 🥝-2 type="button"
    >
    Button
    </button>
  `
  const uno = await createGenerator({
    presets: [
      presetAttributify({ strict: true }),
    ],
    rules: [
      ['🦉', {
        color: 'red',
      }],
    ],
  })

  it('extractor1', async () => {
    expect(await uno.applyExtractors(fixture1)).toMatchSnapshot()
  })

  it('fixture1', async () => {
    const { css } = await uno.generate(fixture1, { preflights: false })
    expect(css).toMatchSnapshot()
  })
})
