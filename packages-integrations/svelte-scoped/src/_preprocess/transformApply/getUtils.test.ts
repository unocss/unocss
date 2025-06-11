import { createGenerator, warnOnce } from '@unocss/core'
import presetWind3 from '@unocss/preset-wind3'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getUtils } from './getUtils'

vi.mock('@unocss/core', async () => {
  const actual = await vi.importActual<typeof import('@unocss/core')>('@unocss/core')
  return {
    ...actual,
    warnOnce: vi.fn(),
    // warnOnce: vi.fn().mockImplementation(() => console.log('hello')),
  }
})

describe('getUtils', async () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const uno = await createGenerator({
    presets: [
      presetWind3(),
    ],
  })

  it('combines rules with same selector', async () => {
    const body = 'mb-1 mr-1 hover:mr-2'
    const result = await getUtils(body, uno)
    expect(result).toMatchInlineSnapshot(`
      [
        [
          90,
          ".\\-",
          "margin-bottom:0.25rem;margin-right:0.25rem;",
          undefined,
          {
            "layer": undefined,
            "sort": undefined,
          },
          undefined,
          undefined,
        ],
        [
          90,
          ".\\-:hover",
          "margin-right:0.5rem;",
          undefined,
          {
            "layer": undefined,
            "sort": 24,
          },
          undefined,
          true,
        ],
      ]
    `)
  })

  it('expands variant groups and warns on incorrect class', async () => {
    // const warnOnceMock = (warnOnce as Mock).mockImplementation(message => console.warn(`${message}HI`))

    const body = 'hover:(mr-1 font-medium foo fee)'
    const result = await getUtils(body, uno)
    expect(result).toMatchInlineSnapshot(`
      [
        [
          90,
          ".\\-:hover",
          "margin-right:0.25rem;font-weight:500;",
          undefined,
          {
            "layer": undefined,
            "sort": 24,
          },
          undefined,
          true,
        ],
      ]
    `)
    expect(warnOnce).toHaveBeenCalledTimes(2)
  })
})
