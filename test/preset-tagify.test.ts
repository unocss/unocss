import presetIcons from '@unocss/preset-icons'
import { type ExtractorContext, createGenerator } from '@unocss/core'
import { describe, expect, it } from 'vitest'
import presetTagify, { extractorTagify } from '@unocss/preset-tagify'
import presetMini from '@unocss/preset-mini'

describe('tagify', () => {
  it('extractor', async () => {
    const extractor = extractorTagify({})

    const code = `
      <foo>
        <bar>spam</bar>
        <baz eggs />
      </foo>
    `

    expect(extractor.extract!({ code } as ExtractorContext)).toMatchInlineSnapshot(`
      [
        "__TAGIFY__foo",
        "__TAGIFY__bar",
        "__TAGIFY__baz",
      ]
    `)
  })

  it('preset', async () => {
    const uno = createGenerator({
      shortcuts: [
        ['btn', 'px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'],
      ],
      rules: [
        ['custom-rule', { 'background-color': 'pink' }],
      ],
      presets: [
        presetMini(),
        presetTagify(),
      ],
    })

    const code = `
      <flex>
        <h1 class="h2"> excluded heading </h1>
        <text-red> red text </text-red>
        <text-green5:10 />
        <m-1> margin </m-1>
        <custom-rule class="p2"> custom </custom-rule>
        <btn> shortcut </btn>
        <hover:color-red> variant </hover:color-red>
      </flex>
    `

    expect((await uno.generate(code, { preflights: false })).css).toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      btn{padding-left:1rem;padding-right:1rem;padding-top:0.25rem;padding-bottom:0.25rem;display:inline-block;--un-bg-opacity:1;background-color:rgb(13 148 136 / var(--un-bg-opacity));border-radius:0.25rem;--un-text-opacity:1;color:rgb(255 255 255 / var(--un-text-opacity));cursor:pointer;}
      btn:disabled{opacity:0.5;--un-bg-opacity:1;background-color:rgb(75 85 99 / var(--un-bg-opacity));cursor:default;}
      btn:hover{--un-bg-opacity:1;background-color:rgb(15 118 110 / var(--un-bg-opacity));}
      /* layer: default */
      .p2{padding:0.5rem;}
      m-1{margin:0.25rem;}
      text-green5\\:10{color:rgb(34 197 94 / 0.1);}
      text-red{--un-text-opacity:1;color:rgb(248 113 113 / var(--un-text-opacity));}
      hover\\:color-red:hover{--un-text-opacity:1;color:rgb(248 113 113 / var(--un-text-opacity));}
      flex{display:flex;}
      .h2{height:0.5rem;}
      custom-rule{background-color:pink;}"
    `)
  })

  it('exclude tags', async () => {
    const uno = createGenerator({
      presets: [
        presetMini(),
        presetTagify({
          excludedTags: [
            /^h[1-5]$/,
            'table',
          ],
        }),
      ],
    })

    const code = `
      <table />
      <h1> excluded heading </h1>
      <h6> tagified heading </h6>
      <b> bordered </b>
    `

    expect((await uno.generate(code, { preflights: false })).css).toMatchInlineSnapshot(`
      "/* layer: default */
      b{border-width:1px;}
      h6{height:1.5rem;}"
    `)
  })

  it('extraProperties', async () => {
    const uno = createGenerator({
      presets: [
        presetIcons(),
        presetTagify({
          extraProperties:
            matched => matched.startsWith('i-') ? { display: 'inline-block' } : {},
        }),
      ],
    })

    const code = `
      <i-mdi-robot-happy />
    `

    expect((await uno.generate(code, { preflights: false })).css).toContain('display:inline-block')
  })

  it('prefix', async () => {
    const uno = createGenerator({
      presets: [
        presetMini(),
        presetTagify({
          prefix: 'un-',
        }),
      ],
    })

    const code = `
      <flex> </flex>
      <un-flex> </un-flex>
    `

    expect((await uno.generate(code, { preflights: false })).css).toMatchInlineSnapshot(`
      "/* layer: default */
      un-flex{display:flex;}"
    `)
  })
})
