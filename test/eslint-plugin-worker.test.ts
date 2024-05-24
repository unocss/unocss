import { describe, expect, it } from 'vitest'
import { createGenerator } from '@unocss/core'
import { presetUno } from '@unocss/preset-uno'
import { runAsync, setGenerator } from '../packages/eslint-plugin/src/worker'

describe('worker', () => {
  it('blocklist', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
      blocklist: [
        'block',
        [/^text-/, { message: 'foo' }],
        i => i.includes('green'),
      ],
    })
    setGenerator(uno, undefined)
    const rs = await runAsync(undefined, 'blocklist', 'block !block w-3px bg-green-500 text-red-500')
    expect(rs).toEqual([
      ['block', undefined],
      ['bg-green-500', undefined],
      ['text-red-500', { message: 'foo' }],
      ['!block', undefined],
    ])
  })
  it('sort', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
    })
    setGenerator(uno, undefined)
    const rs = await runAsync(undefined, 'sort', 'text-red-300 w-8')
    expect(rs).toMatchInlineSnapshot(`"w-8 text-red-300"`)
  })
})
