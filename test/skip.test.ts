import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { describe, expect, it } from 'vitest'

describe('createGenerator', () => {
  const fixture1 = `
    <button 
      <!-- text-red-100 -->
     class="text-red-50"
    >
     // bg-red-100
    Button
    </button>
  `
  const uno = createGenerator({
    presets: [
      presetUno(),
    ],
  })

  it('skip-comment', async () => {
    const { css } = await uno.generate(fixture1, { preflights: false })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: default */
      .text-red-50{--un-text-opacity:1;color:rgb(254 242 242 / var(--un-text-opacity));}"
    `)
  })
})
