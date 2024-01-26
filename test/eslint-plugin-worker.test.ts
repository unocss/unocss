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
        /^text-/,
        i => i.includes('green'),
      ],
    })
    setGenerator(uno)
    const rs = await runAsync('blocklist', 'block !block w-3px bg-green-500 text-red-500')
    expect(rs).toEqual(['block', 'bg-green-500', 'text-red-500', '!block'])
  })
  it('sort', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
    })
    setGenerator(uno)
    const rs = await runAsync('sort', 'text-red-300 w-8')
    expect(rs).toMatchInlineSnapshot(`"w-8 text-red-300"`)
  })
})
