import { createGenerator, warnOnce } from '@unocss/core'
import presetWind3 from '@unocss/preset-wind3'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getUtils } from '../../../src/_common/transformApply/getUtils'

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

  it('expands variant groups and warns on incorrect class', async () => {
    // const warnOnceMock = (warnOnce as Mock).mockImplementation(message => console.warn(`${message}HI`))

    const body = 'hover:(mr-1 font-medium foo fee)'
    const result = await getUtils(body, uno)
    expect(result.map(([, selector, css]) => [selector, css])).toEqual([
      ['.\\-:hover', 'margin-right:0.25rem;font-weight:500;'],
    ])
    expect(warnOnce).toHaveBeenCalledTimes(2)
  })
})
