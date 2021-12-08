import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { describe, expect, test } from 'vitest'

describe('blocklist', () => {
  test('basic', async() => {
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
      ],
      presets: [
        presetUno(),
      ],
    })
    const { css: css1 } = await uno.generate('block text-red-200 hover:block', { minify: true })
    const { css: css2 } = await dos.generate('block text-red-200 hover:block', { minify: true })
    expect(css1).contain('.block')
    expect(css1).contain('.text-red-200')
    expect(css2).eq('')

    const { css: css3 } = await dos.generate('block text-red-200 hover:block', { minify: true })
    expect(css3).eq('')
  })
})
