import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
import { describe, test, expect } from 'vitest'

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
    ],
    presets: [
      presetUno(),
    ],
  })

  test('static', async() => {
    const { css } = await uno.generate('sh1 sh2 focus:sh2 sh3')
    expect(css).toMatchSnapshot()
  })

  test('nesting static', async() => {
    const { css } = await uno.generate('btn1 btn btn2')
    expect(css).toMatchSnapshot()
  })

  test('dynamic', async() => {
    const { css } = await uno.generate('button-1 button-2')
    expect(css).toMatchSnapshot()
  })

  test('merge transform-duplicated', async() => {
    const { css } = await uno.generate('transform-duplicated')
    const prettified = prettier.format(css, {
      parser: 'css',
      plugins: [parserCSS],
    })
    expect(prettified).toMatchSnapshot()
  })
})
