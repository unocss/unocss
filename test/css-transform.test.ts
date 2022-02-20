import { readFile } from 'fs/promises'
import { describe, expect, test } from 'vitest'
import { transformCSS } from '@unocss/css-transform'
import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'

describe('css-transform', () => {
  const uno = createGenerator({
    presets: [
      presetUno({
        dark: 'media',
      }),
    ],
    shortcuts: {
      btn: 'px-2 py-3 md:px-4 bg-blue-500 text-white rounded',
    },
  })

  test('basic', async() => {
    const result = await transformCSS(
      '.btn { @apply rounded text-lg font-mono; }',
      uno,
    )
    expect(result)
      .toMatchInlineSnapshot('".btn{border-radius:0.25rem;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,\\"Liberation Mono\\",\\"Courier New\\",monospace;font-size:1.125rem;line-height:1.75rem}"')
  })

  test('breakpoint', async() => {
    const result = await transformCSS(
      '.btn { @apply m-1 md:m-2 lg:m-3; }',
      uno,
    )
    expect(result)
      .toMatchInlineSnapshot('"@media (min-width:768px){.btn{margin:0.5rem}}@media (min-width:1024px){.btn{margin:0.75rem}}.btn{margin:0.25rem}"')
  })

  test('pseudo-classes', async() => {
    const result = await transformCSS(
      '.btn { @apply p-3 hover:bg-white focus:border }',
      uno,
    )
    expect(result)
      .toMatchInlineSnapshot('".btn:focus{border-width:1px;border-style:solid}.btn:hover{--un-bg-opacity:1;background-color:rgba(255,255,255,var(--un-bg-opacity))}.btn{padding:0.75rem}"')
  })

  test('element selector', async() => {
    const result = await transformCSS(
      'input { @apply px-3 focus:border; }',
      uno,
    )
    expect(result)
      .toMatchInlineSnapshot('"input:focus{border-width:1px;border-style:solid}input{padding-left:0.75rem;padding-right:0.75rem}"')
  })

  test('multiple apply', async() => {
    const result = await transformCSS(
      '.btn { @apply p-3; @apply bg-white; @apply hover:bg-blue-500; @apply hover:border }',
      uno,
    )
    expect(result)
      .toMatchInlineSnapshot('".btn:hover{border-width:1px;border-style:solid}.btn:hover{--un-bg-opacity:1;background-color:rgba(59,130,246,var(--un-bg-opacity))}.btn{padding:0.75rem;--un-bg-opacity:1;background-color:rgba(255,255,255,var(--un-bg-opacity))}"')
  })

  test('css file', async() => {
    const css = await readFile('./test/assets/apply.css', 'utf8')
    const result = await transformCSS(css, uno)

    expect(result).toMatchSnapshot()
  })
})
