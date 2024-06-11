import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
import { describe, expect, it } from 'vitest'

describe('shortcuts', () => {
  const uno = createGenerator({
    shortcuts: [
      {
        sh1: 'px-2 py-3 sh3',
        sh2: 'hover:text-lg text-sm text-lg',
        sh3: 'sm:m-2 m-3',
      },
      {
        btn: 'mr-10',
        btn1: 'ml-10 btn',
        btn2: 'sh1 btn1',
      },
      {
        btn: 'mr-8',
        primary: 'text-orange-800 bg-white',
        accent: 'text-cyan-800 bg-black',
        btn3: 'primary hover:(accent underline) focus:border',
      },
      [/^button-(\d)$/, ([, d]) => [`px${(+d) * 3}`, `py${(+d) * 2}`]],
      ['bad-one', 'p2 unmatched'],
      ['transform-duplicated', 'translate-x-1 translate-y-2 scale-4 hover:scale-2 active:scale-x-4'],
      ['shortcut-hover-active-1', 'focus:bg-green-300 hover:bg-green-300 active:bg-green-300'],
      ['shortcut-hover-active-2', 'focus:bg-red-300 hover:bg-yellow-300 active:bg-blue-300'],
      ['loading', 'animate-spin duration-1000'],
      ['shortcut-inline-body', ['p2', { margin: '3px' }]],
      [/^shortcut-inline-dynamic-(\d)$/, ([,d]) => [`p${d}`, { margin: `${d}px` }]],
      {
        'test': 'focus:text-green',
        'test-last': 'focus:text-blue',
      },
      {
        'space-default': 'space-y-2 dark:space-y-4',
        'divide-default': 'divide-[#000000] dark:divide-[#33334a]',
      },
    ],
    presets: [
      presetUno(),
    ],
    rules: [
      [/^with-no-merge$/, (_, ctx) => [
        {
          'no-merge': 1,
          [ctx.symbols.shortcutsNoMerge]: true,
        },
        {
          merged: 1,
        },
      ]],
      ['merge-candidate', { merged: 1 }],
    ],
  })

  it('static', async () => {
    const { css } = await uno.generate('sh1 sh2 focus:sh2 sh3', { preflights: false })
    await expect(css).toMatchFileSnapshot('./assets/output/shortcuts-static.css')
  })

  it('nesting static', async () => {
    const { css } = await uno.generate('btn1 btn btn2', { preflights: false })
    await expect(css).toMatchFileSnapshot('./assets/output/shortcuts-nesting-static.css')
  })

  it('dynamic', async () => {
    const { css } = await uno.generate('button-1 button-2', { preflights: false })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .button-1{padding-left:0.75rem;padding-right:0.75rem;padding-top:0.5rem;padding-bottom:0.5rem;}
      .button-2{padding-left:1.5rem;padding-right:1.5rem;padding-top:1rem;padding-bottom:1rem;}"
    `)
  })

  it('merge transform-duplicated', async () => {
    const { css } = await uno.generate('transform-duplicated', { preflights: false })
    const prettified = prettier.format(css, {
      parser: 'css',
      plugins: [parserCSS],
    })
    await expect(prettified).toMatchFileSnapshot('./assets/output/shortcuts-transform-duplicated.css')
  })

  it('no-merge', async () => {
    const { css } = await uno.generate('with-no-merge merge-candidate', { preflights: false })
    await expect(css).toMatchFileSnapshot('./assets/output/shortcuts-no-merge.css')
  })

  it('variant order', async () => {
    const { css } = await uno.generate('shortcut-hover-active-1', { preflights: false })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .shortcut-hover-active-1:hover{--un-bg-opacity:1;background-color:rgb(134 239 172 / var(--un-bg-opacity));}
      .shortcut-hover-active-1:focus{--un-bg-opacity:1;background-color:rgb(134 239 172 / var(--un-bg-opacity));}
      .shortcut-hover-active-1:active{--un-bg-opacity:1;background-color:rgb(134 239 172 / var(--un-bg-opacity));}"
    `)
  })

  it('variant order 1', async () => {
    const { css } = await uno.generate('shortcut-hover-active-2', { preflights: false })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .shortcut-hover-active-2:hover{--un-bg-opacity:1;background-color:rgb(253 224 71 / var(--un-bg-opacity));}
      .shortcut-hover-active-2:focus{--un-bg-opacity:1;background-color:rgb(252 165 165 / var(--un-bg-opacity));}
      .shortcut-hover-active-2:active{--un-bg-opacity:1;background-color:rgb(147 197 253 / var(--un-bg-opacity));}"
    `)
  })

  it('variant order 2', async () => {
    const { css } = await uno.generate('shortcut-hover-active-2 uno-layer-shortcuts:bg-red-300', { preflights: false })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .uno-layer-shortcuts\\:bg-red-300{--un-bg-opacity:1;background-color:rgb(252 165 165 / var(--un-bg-opacity));}
      .shortcut-hover-active-2:hover{--un-bg-opacity:1;background-color:rgb(253 224 71 / var(--un-bg-opacity));}
      .shortcut-hover-active-2:focus{--un-bg-opacity:1;background-color:rgb(252 165 165 / var(--un-bg-opacity));}
      .shortcut-hover-active-2:active{--un-bg-opacity:1;background-color:rgb(147 197 253 / var(--un-bg-opacity));}"
    `)
  })

  it('variant order 3', async () => {
    const { css } = await uno.generate('shortcut-hover-active-2 uno-layer-shortcuts:bg-yellow-300', { preflights: false })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .uno-layer-shortcuts\\:bg-yellow-300{--un-bg-opacity:1;background-color:rgb(253 224 71 / var(--un-bg-opacity));}
      .shortcut-hover-active-2:hover{--un-bg-opacity:1;background-color:rgb(253 224 71 / var(--un-bg-opacity));}
      .shortcut-hover-active-2:focus{--un-bg-opacity:1;background-color:rgb(252 165 165 / var(--un-bg-opacity));}
      .shortcut-hover-active-2:active{--un-bg-opacity:1;background-color:rgb(147 197 253 / var(--un-bg-opacity));}"
    `)
  })

  it('variant order 4', async () => {
    const { css } = await uno.generate('shortcut-hover-active-2 uno-layer-shortcuts:bg-blue-300', { preflights: false })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .uno-layer-shortcuts\\:bg-blue-300{--un-bg-opacity:1;background-color:rgb(147 197 253 / var(--un-bg-opacity));}
      .shortcut-hover-active-2:hover{--un-bg-opacity:1;background-color:rgb(253 224 71 / var(--un-bg-opacity));}
      .shortcut-hover-active-2:focus{--un-bg-opacity:1;background-color:rgb(252 165 165 / var(--un-bg-opacity));}
      .shortcut-hover-active-2:active{--un-bg-opacity:1;background-color:rgb(147 197 253 / var(--un-bg-opacity));}"
    `)
  })

  it('animate', async () => {
    const { css } = await uno.generate('loading', { preflights: false })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .loading{animation:spin 1s linear infinite;transition-duration:1000ms;}
      /* layer: default */
      @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"
    `)
  })

  it('shortcut of nested pseudo', async () => {
    const { css } = await uno.generate('btn3 focus:btn3 hover:btn3 focus:hover:btn3', { preflights: false })
    await expect(css).toMatchFileSnapshot('./assets/output/shortcuts-nested-pseudo.css')
  })

  it('shortcut with inline body', async () => {
    const { css } = await uno.generate(`
      shortcut-inline-body
      hover:shortcut-inline-body
      shortcut-inline-dynamic-1
      shortcut-inline-dynamic-2
    `, { preflights: false })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .shortcut-inline-body{padding:0.5rem;margin:3px;}
      .shortcut-inline-dynamic-1{padding:0.25rem;margin:1px;}
      .shortcut-inline-dynamic-2{padding:0.5rem;margin:2px;}
      .hover\\:shortcut-inline-body:hover{padding:0.5rem;margin:3px;}"
    `)
  })

  it('shortcut order', async () => {
    const { css } = await uno.generate('test test-last', { preflights: false })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .test:focus{--un-text-opacity:1;color:rgb(74 222 128 / var(--un-text-opacity));}
      .test-last:focus{--un-text-opacity:1;color:rgb(96 165 250 / var(--un-text-opacity));}"
    `)
  })

  it('divide', async () => {
    const { css } = await uno.generate('divide-y divide-default', { preflights: false })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .dark .divide-default>:not([hidden])~:not([hidden]){--un-divide-opacity:1;border-color:rgb(51 51 74 / var(--un-divide-opacity));}
      .divide-default>:not([hidden])~:not([hidden]){--un-divide-opacity:1;border-color:rgb(0 0 0 / var(--un-divide-opacity));}
      /* layer: default */
      .divide-y>:not([hidden])~:not([hidden]){--un-divide-y-reverse:0;border-top-width:calc(1px * calc(1 - var(--un-divide-y-reverse)));border-bottom-width:calc(1px * var(--un-divide-y-reverse));}"
    `)
  })

  it('space', async () => {
    const { css } = await uno.generate('space-x-2px space-default', { preflights: false })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .dark .space-default>:not([hidden])~:not([hidden]){--un-space-y-reverse:0;margin-top:calc(1rem * calc(1 - var(--un-space-y-reverse)));margin-bottom:calc(1rem * var(--un-space-y-reverse));}
      .space-default>:not([hidden])~:not([hidden]){--un-space-y-reverse:0;margin-top:calc(0.5rem * calc(1 - var(--un-space-y-reverse)));margin-bottom:calc(0.5rem * var(--un-space-y-reverse));}
      /* layer: default */
      .space-x-2px>:not([hidden])~:not([hidden]){--un-space-x-reverse:0;margin-left:calc(2px * calc(1 - var(--un-space-x-reverse)));margin-right:calc(2px * var(--un-space-x-reverse));}"
    `)
  })

  it('layer', async () => {
    const { css } = await uno.generate('uno-layer-l1:sh1 sh2 focus:uno-layer-l2:sh2 uno-layer-l3:sh3', { preflights: false })
    await expect(css).toMatchFileSnapshot('./assets/output/shortcuts-layer.css')
  })
})
