import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { describe, expect, test } from 'vitest'
import { autoPrefixer } from '../packages/runtime/src'

function mockElementWithStyle() {
  const store: any = {}
  return {
    style: {
      WebkitPerspective: '',
      setProperty(key: string, val: string) {
        store[key] = val
      },
      getPropertyValue(key: string) {
        return store[key]
      },
    },
  }
}

const uno = createGenerator({
  presets: [
    presetUno(),
  ],
  postprocess: [
    autoPrefixer(mockElementWithStyle().style),
  ],
})

describe('runtime auto prefix', () => {
  test('css variable', async() => {
    const { css } = await uno.generate('c-op-100')
    expect(css).toMatchSnapshot()
  })

  test('vendor', async() => {
    const { css } = await uno.generate('perspect-1px')
    expect(css).toMatchSnapshot()
  })
})
