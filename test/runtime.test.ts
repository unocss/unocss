import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import presetTagify from '@unocss/preset-tagify'
import { describe, expect, test } from 'vitest'
import { autoPrefixer, decodeHtml } from '../packages/runtime/src/utils'

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
  test('without autoprefixer', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
    })

    const { css } = await uno.generate(targets, { preflights: false })
    expect(css).toMatchSnapshot()
  })

  test('using autoprefixer', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
      postprocess: [
        autoPrefixer(mockElementWithStyle().style as any),
      ],
    })

    const { css } = await uno.generate(targets, { preflights: false })
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
    `, { preflights: false })
    expect(css).toMatchSnapshot()
  })
})

describe('runtime decode html', () => {
  test('decode function', async () => {
    expect(decodeHtml('<tag class="[&_*]:text-red>"')).toMatchInlineSnapshot('"<tag class=\\"[&_*]:text-red>\\""')
    expect(decodeHtml('<tag class="[&amp;_*]:text-red>"')).toMatchInlineSnapshot('"<tag class=\\"[&_*]:text-red>\\""')
    expect(decodeHtml('<tag class="[&amp;>*]:text-red>"')).toMatchInlineSnapshot('"<tag class=\\"[&>*]:text-red>\\""')
    expect(decodeHtml('<tag class="[&amp;&gt;*]:text-red>"')).toMatchInlineSnapshot('"<tag class=\\"[&>*]:text-red>\\""')
    expect(decodeHtml('<tag class="[&<*]:text-red>"')).toMatchInlineSnapshot('"<tag class=\\"[&<*]:text-red>\\""')
    expect(decodeHtml('<tag class="[&&lt;*]:text-red>"')).toMatchInlineSnapshot('"<tag class=\\"[&<*]:text-red>\\""')
  })

  test('not decoding all entities', async () => {
    expect(decodeHtml('<tag class="[&_*]:content-[&nbsp;]>"')).toMatchInlineSnapshot('"<tag class=\\"[&_*]:content-[&nbsp;]>\\""')
  })
})

describe('runtime code split', () => {
  test('html tag code split', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
    })
    const { matched } = await uno.generate(`
    <div m-1>
      123
    </div>
    <div m-2/>
    <div m-3 p-1>
      223
    </div>
    <div m-4 p-2/>
    `,
    { preflights: false, minify: true },
    )
    expect(matched).toMatchSnapshot()
  })
})
