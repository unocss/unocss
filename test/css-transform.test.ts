import console from 'console'
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

  test('basic inline', async() => {
    const result = await transformCSS(
      '.btn { @apply btn md:m4 rounded text-lg font-mono; .active { @apply bg-white; } }',
      uno,
    )
    console.log(result)
    expect(result)
      .toMatchInlineSnapshot('"@media (min-width:768px){.btn{margin:1rem}}@media (min-width:768px){.btn{padding-left:1rem;padding-right:1rem}}.btn{border-radius:0.25rem;--un-bg-opacity:1;background-color:rgba(59,130,246,var(--un-bg-opacity));padding-left:0.5rem;padding-right:0.5rem;padding-top:0.75rem;padding-bottom:0.75rem;--un-text-opacity:1;color:rgba(255,255,255,var(--un-text-opacity));border-radius:0.25rem;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,\\"Liberation Mono\\",\\"Courier New\\",monospace;font-size:1.125rem;line-height:1.75rem;.active { @apply bg-white; }}"')
  })

  test('css file', async() => {
    const css = await readFile('./test/assets/apply.css', 'utf8')
    const result = await transformCSS(css, uno)

    expect(result).toMatchSnapshot()
  })
})
