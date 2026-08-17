import { createGenerator } from '@unocss/core'
import presetWind3 from '@unocss/preset-wind3'
import { describe, expect, it } from 'vitest'

describe('blocklist', () => {
  it('matches each rule type, including metadata tuples', async () => {
    const uno = await createGenerator({
      blocklist: [
        'string-rule',
        /^regexp-/,
        token => token === 'function-rule',
        ['tuple-string', { message: 'string metadata' }],
        [/^tuple-regexp-/, { message: 'regexp metadata' }],
        [token => token === 'tuple-function', { message: 'function metadata' }],
      ],
    })

    expect(uno.isBlocked('')).toBe(true)
    expect(uno.isBlocked('string-rule')).toBe(true)
    expect(uno.isBlocked('regexp-rule')).toBe(true)
    expect(uno.isBlocked('function-rule')).toBe(true)
    expect(uno.isBlocked('tuple-string')).toBe(true)
    expect(uno.isBlocked('tuple-regexp-rule')).toBe(true)
    expect(uno.isBlocked('tuple-function')).toBe(true)
    expect(uno.isBlocked('allowed-rule')).toBe(false)
  })

  it('basic', async () => {
    const uno = await createGenerator({
      presets: [
        presetWind3(),
      ],
    })
    const dos = await createGenerator({
      warn: false,
      blocklist: [
        'block',
        /^text-/,
        i => i.includes('green'),
      ],
      presets: [
        presetWind3(),
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
