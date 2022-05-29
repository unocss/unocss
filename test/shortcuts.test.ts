import { CONTROL_SHORTCUT_NO_MERGE, createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
import { describe, expect, test } from 'vitest'

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
      [/^button-(\d)$/, ([, d]) => [`px${(+d) * 3}`, `py${(+d) * 2}`]],
      ['bad-one', 'p2 unmatched'],
      ['transform-duplicated', 'translate-x-1 translate-y-2 scale-4 hover:scale-2 active:scale-x-4'],
      ['shortcut-hover-active-1', 'focus:bg-green-300 hover:bg-green-300 active:bg-green-300'],
      ['shortcut-hover-active-2', 'focus:bg-red-300 hover:bg-yellow-300 active:bg-blue-300'],
      ['loading', 'animate-spin duration-1000'],
    ],
    presets: [
      presetUno(),
    ],
    rules: [
      [/^with-no-merge$/, () => [
        {
          'no-merge': 1,
          [CONTROL_SHORTCUT_NO_MERGE]: '',
        },
        {
          merged: 1,
        },
      ]],
      ['merge-candidate', { merged: 1 }],
    ],
  })

  test('static', async () => {
    const { css } = await uno.generate('sh1 sh2 focus:sh2 sh3')
    expect(css).toMatchSnapshot()
  })

  test('nesting static', async () => {
    const { css } = await uno.generate('btn1 btn btn2')
    expect(css).toMatchSnapshot()
  })

  test('dynamic', async () => {
    const { css } = await uno.generate('button-1 button-2')
    expect(css).toMatchSnapshot()
  })

  test('merge transform-duplicated', async () => {
    const { css } = await uno.generate('transform-duplicated')
    const prettified = prettier.format(css, {
      parser: 'css',
      plugins: [parserCSS],
    })
    expect(prettified).toMatchSnapshot()
  })

  test('no-merge', async () => {
    const { css } = await uno.generate('with-no-merge merge-candidate')
    expect(css).toMatchSnapshot()
  })

  test('variant order', async () => {
    const { css } = await uno.generate('shortcut-hover-active-1')
    expect(css).toMatchSnapshot()
  })

  test('variant order', async () => {
    const { css } = await uno.generate('shortcut-hover-active-2')
    expect(css).toMatchSnapshot()
  })

  test('variant order', async () => {
    const { css } = await uno.generate('shortcut-hover-active-2 uno-layer-shortcuts:bg-red-300')
    expect(css).toMatchSnapshot()
  })

  test('variant order', async () => {
    const { css } = await uno.generate('shortcut-hover-active-2 uno-layer-shortcuts:bg-yellow-300')
    expect(css).toMatchSnapshot()
  })

  test('variant order', async () => {
    const { css } = await uno.generate('shortcut-hover-active-2 uno-layer-shortcuts:bg-blue-300')
    expect(css).toMatchSnapshot()
  })

  test('animate', async () => {
    const { css } = await uno.generate('loading')
    expect(css).toMatchSnapshot()
  })
})
