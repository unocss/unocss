import { readFile } from 'fs/promises'
import { describe, expect, test } from 'vitest'
import { transformDirectives } from '@unocss/transformer-directives'
import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'

describe('transformer-directives', () => {
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

  async function transform(code: string) {
    const result = await transformDirectives(code, uno)
    if (result == null)
      return null
    return prettier.format(result, {
      parser: 'css',
      plugins: [parserCSS],
    })
  }

  test('basic', async() => {
    const result = await transform(
      '.btn { @apply rounded text-lg font-mono; }',
    )
    expect(result)
      .toMatchInlineSnapshot(`
        ".btn {
          border-radius: 0.25rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            \\"Liberation Mono\\", \\"Courier New\\", monospace;
          font-size: 1.125rem;
          line-height: 1.75rem;
        }
        "
      `)
  })

  test('breakpoint', async() => {
    const result = await transform(
      '.btn { @apply m-1 md:m-2 lg:m-3; }',
    )
    expect(result)
      .toMatchInlineSnapshot(`
        "@media (min-width: 768px) {
          .btn {
            margin: 0.5rem;
          }
        }
        @media (min-width: 1024px) {
          .btn {
            margin: 0.75rem;
          }
        }
        .btn {
          margin: 0.25rem;
        }
        "
      `)
  })

  test('variant group', async() => {
    const result = await transform(
      '.btn { @apply grid-(cols-2 rows-4) hover:(border bg-white) }',
    )
    expect(result)
      .toMatchInlineSnapshot(`
        ".btn:hover {
          border-width: 1px;
          border-style: solid;
          --un-bg-opacity: 1;
          background-color: rgba(255, 255, 255, var(--un-bg-opacity));
        }
        .btn {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-template-rows: repeat(4, minmax(0, 1fr));
        }
        "
      `)
  })

  test('pseudo-classes', async() => {
    const result = await transform(
      '.btn { @apply p-3 hover:bg-white focus:border }',
    )
    expect(result)
      .toMatchInlineSnapshot(`
        ".btn:focus {
          border-width: 1px;
          border-style: solid;
        }
        .btn:hover {
          --un-bg-opacity: 1;
          background-color: rgba(255, 255, 255, var(--un-bg-opacity));
        }
        .btn {
          padding: 0.75rem;
        }
        "
      `)
  })

  test('element selector', async() => {
    const result = await transform(
      'input { @apply px-3 focus:border; }',
    )
    expect(result)
      .toMatchInlineSnapshot(`
        "input:focus {
          border-width: 1px;
          border-style: solid;
        }
        input {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }
        "
      `)
  })

  test('multiple selector', async() => {
    const result = await transform(
      '.btn,.box { @apply px-3 focus:border; }',
    )
    expect(result)
      .toMatchInlineSnapshot(`
        ".btn:focus,
        .box:focus {
          border-width: 1px;
          border-style: solid;
        }
        .btn,
        .box {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }
        "
      `)
  })

  test('two class selector', async() => {
    const result = await transform(
      '.btn.box { @apply px-3 focus:border; }',
    )
    expect(result)
      .toMatchInlineSnapshot(`
        ".btn.box:focus {
          border-width: 1px;
          border-style: solid;
        }
        .btn.box {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }
        "
      `)
  })

  test('multiple apply', async() => {
    const result = await transform(
      `.btn { 
        @apply p-3;
        @apply bg-white;
        @apply hover:bg-blue-500;
        @apply hover:border;
      }`,
    )
    expect(result)
      .toMatchInlineSnapshot(`
        ".btn:hover {
          border-width: 1px;
          border-style: solid;
        }
        .btn:hover {
          --un-bg-opacity: 1;
          background-color: rgba(59, 130, 246, var(--un-bg-opacity));
        }
        .btn {
          padding: 0.75rem;
          --un-bg-opacity: 1;
          background-color: rgba(255, 255, 255, var(--un-bg-opacity));
        }
        "
      `)
  })

  test('css file', async() => {
    const css = await readFile('./test/assets/apply.css', 'utf8')
    const result = await transform(css)

    expect(result).toMatchSnapshot()
  })
})
