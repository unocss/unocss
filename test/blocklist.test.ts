import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { describe, expect, it } from 'vitest'

describe('blocklist', () => {
  it('basic', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
    })
    const dos = createGenerator({
      warn: false,
      blocklist: [
        'block',
        /^text-/,
        i => i.includes('green'),
      ],
      presets: [
        presetUno(),
      ],
    })
    const { css: css1 } = await uno.generate('block text-red-200 hover:block bg-green text-green', { minify: true, preflights: false })
    const { css: css2 } = await dos.generate('block text-red-200 hover:block bg-green text-green', { minify: true, preflights: false })
    expect(css1).contain('.block')
    expect(css1).contain('.text-red-200')
    expect(css1).contain('.text-green')
    expect(css2).eq('')

    const { css: css3 } = await dos.generate('block text-red-200 hover:block', { minify: true, preflights: false })
    expect(css3).eq('')
  })
})
