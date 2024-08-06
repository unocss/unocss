import { describe, expect, it } from 'vitest'
import { createGenerator } from '@unocss/core'
import { presetUno } from '@unocss/preset-uno'
import { presetMini } from '@unocss/preset-mini'
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

  it('sort presetMini should be same as presetUno', async () => {
    const uno1 = createGenerator({
      presets: [
        presetMini(),
      ],
    })
    const uno2 = createGenerator({
      presets: [
        presetUno(),
      ],
    })

    const input = 'absolute left-1/2 top-1/2 h-100 w-100 flex items-center justify-center -translate-1/2'

    setGenerator(uno1, undefined)
    const rs1 = await runAsync(undefined, 'sort', input)

    setGenerator(uno2, undefined)
    const rs2 = await runAsync(undefined, 'sort', input)

    expect(rs1).toEqual(rs2)
  })
})
