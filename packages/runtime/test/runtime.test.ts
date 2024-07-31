import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import presetTagify from '@unocss/preset-tagify'
import { describe, expect, it } from 'vitest'
import { autoPrefixer, decodeHtml } from '../src/utils'

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
  it('without autoprefixer', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
    })

    const { css } = await uno.generate(targets, { preflights: false })
    expect(css).toMatchSnapshot()
  })

  it('using autoprefixer', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
      postprocess: [
        autoPrefixer(mockElementWithStyle().style as any),
      ],
    })

    const { css } = await uno.generate(targets, { preflights: false })
    expect(css).toMatchFileSnapshot('./assets/output/runtime-preset-uno-autoprefixer.css')
  })

  it('runtime tagify', async () => {
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
    await expect(css).toMatchFileSnapshot('./assets/output/runtime-preset-tagify.css')
  })
})

describe('runtime decode html', () => {
  it('decode function', async () => {
    expect(decodeHtml('<tag class="[&_*]:text-red>"')).toMatchInlineSnapshot(`"<tag class="[&_*]:text-red>""`)
    expect(decodeHtml('<tag class="[&amp;_*]:text-red>"')).toMatchInlineSnapshot(`"<tag class="[&_*]:text-red>""`)
    expect(decodeHtml('<tag class="[&amp;>*]:text-red>"')).toMatchInlineSnapshot(`"<tag class="[&>*]:text-red>""`)
    expect(decodeHtml('<tag class="[&amp;&gt;*]:text-red>"')).toMatchInlineSnapshot(`"<tag class="[&>*]:text-red>""`)
    expect(decodeHtml('<tag class="[&<*]:text-red>"')).toMatchInlineSnapshot(`"<tag class="[&<*]:text-red>""`)
    expect(decodeHtml('<tag class="[&&lt;*]:text-red>"')).toMatchInlineSnapshot(`"<tag class="[&<*]:text-red>""`)
  })

  it('not decoding all entities', async () => {
    expect(decodeHtml('<tag class="[&_*]:content-[&nbsp;]>"')).toMatchInlineSnapshot(`"<tag class="[&_*]:content-[&nbsp;]>""`)
  })
})
