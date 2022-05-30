import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import presetTagify from '@unocss/preset-tagify'
import { describe, expect, test } from 'vitest'
import { autoPrefixer } from '../packages/runtime/src/utils'

function mockElementWithStyle() {
  const store: any = {}
  return {
    style: {
      WebkitFilter: '',
      WebkitPerspective: '',
      WebkitVars: '',
      msHyphens: '',
      MsNonHyphens: '',
      setProperty(key: string, val: string) {
        store[key] = val
      },
      getPropertyValue(key: string) {
        return store[key]
      },
    },
  }
}

const targets = [
  'filter', // whitelisted in function
  'perspect-1px', // Webkit prefix
  'hyphens-auto', // ms prefix
  '[--vars:value]', // css variable
  '[-vars:value]',
  '[vars:value]',
  '[filter:none]',
  '[perspective:0]',
  '[hyphens:none]',
  '[non-hyphens:none]',
].join(' ')

describe('runtime auto prefixer', () => {
  test('without autoprfixer', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
    })

    const { css } = await uno.generate(targets)
    expect(css).toMatchSnapshot()
  })

  test('using autoprfixer', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
      postprocess: [
        autoPrefixer(mockElementWithStyle().style as any),
      ],
    })

    const { css } = await uno.generate(targets)
    expect(css).toMatchSnapshot()
  })

  test('runtime tagify', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
        presetTagify(),
      ],
    })

    const { css } = await uno.generate(`
      <flex>
        <text-red> red text </text-red>
        <text-green5:10 />
        <m-1 class="p2"> margin </m-1>
        <btn> shortcut </btn>
        <hover:color-red> variant </hover:color-red>
        <scale-2> zoom </scale-2>
        <shadow-xl> modal </shadow-xl>
      </flex>
    `)
    expect(css).toMatchSnapshot()
  })
})
