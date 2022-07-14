import { readFile } from 'fs/promises'
import { describe, expect, test } from 'vitest'
import { transformDirectives } from '@unocss/transformer-directives'
import type { UnoGenerator } from '@unocss/core'
import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
import MagicString from 'magic-string'

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

  async function transform(code: string, _uno: UnoGenerator = uno) {
    const s = new MagicString(code)
    await transformDirectives(s, _uno, {})
    return prettier.format(s.toString(), {
      parser: 'css',
      plugins: [parserCSS],
    })
  }

  test('basic', async () => {
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

  test('breakpoint', async () => {
    const result = await transform(
      '.grid { @apply grid grid-cols-2 xl:grid-cols-10 sm:grid-cols-7 md:grid-cols-3 lg:grid-cols-4 }',
    )
    expect(result)
      .toMatchInlineSnapshot(`
        ".grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        @media (min-width: 640px) {
          .grid {
            grid-template-columns: repeat(7, minmax(0, 1fr));
          }
        }
        @media (min-width: 768px) {
          .grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          .grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
        @media (min-width: 1280px) {
          .grid {
            grid-template-columns: repeat(10, minmax(0, 1fr));
          }
        }
        "
      `)
  })

  test('variant group', async () => {
    const result = await transform(
      '.btn { @apply grid-(cols-2 rows-4) hover:(border bg-white) }',
    )
    expect(result)
      .toMatchInlineSnapshot(`
        ".btn {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-template-rows: repeat(4, minmax(0, 1fr));
        }
        .btn:hover {
          border-width: 1px;
          border-style: solid;
          --un-bg-opacity: 1;
          background-color: rgba(255, 255, 255, var(--un-bg-opacity));
        }
        "
      `)
  })

  test('pseudo-classes', async () => {
    const result = await transform(
      '.btn { @apply p-3 hover:bg-white focus:border }',
    )
    expect(result)
      .toMatchInlineSnapshot(`
        ".btn {
          padding: 0.75rem;
        }
        .btn:focus {
          border-width: 1px;
          border-style: solid;
        }
        .btn:hover {
          --un-bg-opacity: 1;
          background-color: rgba(255, 255, 255, var(--un-bg-opacity));
        }
        "
      `)
  })

  test('multiple pseudo-classes', async () => {
    const result = await transform(
      '.btn { @apply sm:hover:bg-white }',
    )
    expect(result)
      .toMatchInlineSnapshot(`
        ".btn {
        }
        @media (min-width: 640px) {
          .btn:hover {
            --un-bg-opacity: 1;
            background-color: rgba(255, 255, 255, var(--un-bg-opacity));
          }
        }
        "
      `)
  })

  test('element selector', async () => {
    const result = await transform(
      'input { @apply px-3 focus:border; }',
    )
    expect(result)
      .toMatchInlineSnapshot(`
        "input {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }
        input:focus {
          border-width: 1px;
          border-style: solid;
        }
        "
      `)
  })

  test('multiple selector', async () => {
    const result = await transform(
      '.btn,.box { @apply px-3 focus:border; }',
    )
    expect(result)
      .toMatchInlineSnapshot(`
        ".btn,
        .box {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }
        .btn:focus,
        .box:focus {
          border-width: 1px;
          border-style: solid;
        }
        "
      `)
  })

  test('two class selector', async () => {
    const result = await transform(
      '.btn.box { @apply px-3 focus:border; }',
    )
    expect(result)
      .toMatchInlineSnapshot(`
        ".btn.box {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }
        .btn.box:focus {
          border-width: 1px;
          border-style: solid;
        }
        "
      `)
  })

  test('multiple apply', async () => {
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
        ".btn {
          padding: 0.75rem;
          --un-bg-opacity: 1;
          background-color: rgba(255, 255, 255, var(--un-bg-opacity));
        }
        .btn:hover {
          border-width: 1px;
          border-style: solid;
        }
        .btn:hover {
          --un-bg-opacity: 1;
          background-color: rgba(59, 130, 246, var(--un-bg-opacity));
        }
        "
      `)
  })

  test('dark class', async () => {
    const uno = createGenerator({
      presets: [
        presetUno({
          dark: 'class',
        }),
      ],
      shortcuts: {
        btn: 'px-2 py-3 md:px-4 bg-blue-500 text-white rounded',
      },
    })
    const result = await transform(
      `.btn {
        @apply bg-white dark:bg-black;
      }`,
      uno,
    )
    expect(result)
      .toMatchInlineSnapshot(`
        ".btn {
          --un-bg-opacity: 1;
          background-color: rgba(255, 255, 255, var(--un-bg-opacity));
        }
        .dark .btn {
          --un-bg-opacity: 1;
          background-color: rgba(0, 0, 0, var(--un-bg-opacity));
        }
        "
      `)
  })

  test('nested class', async () => {
    const result = await transform(
      `nav {
        ul {
          li {
            @apply border;
          }
        }
        a {
          @apply px-2 hover:underline;
        }
      }`,
    )
    expect(result)
      .toMatchInlineSnapshot(`
        "nav {
          ul {
            li {
              border-width: 1px;
              border-style: solid;
            }
          }
          a {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
          a:hover {
            text-decoration-line: underline;
          }
        }
        "
      `)
  })

  test('css file', async () => {
    const css = await readFile('./test/assets/apply.css', 'utf8')
    const result = await transform(css)

    expect(result).toMatchSnapshot()
  })

  test('custom breakpoints', async () => {
    const customUno = createGenerator({
      presets: [
        presetUno(),
      ],
      theme: {
        breakpoints: {
          'xs': '320px',
          'sm': '640px',
          'md': '768px',
          'lg': '1024px',
          'xl': '1280px',
          '2xl': '1536px',
          'xxl': '1536px',
        },
      },
    })
    const result = await transform(
      '.grid { @apply grid grid-cols-2 xs:grid-cols-1 xxl:grid-cols-15 xl:grid-cols-10 sm:grid-cols-7 md:grid-cols-3 lg:grid-cols-4 }',
      customUno,
    )
    expect(result)
      .toMatchInlineSnapshot(`
        ".grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        @media (min-width: 320px) {
          .grid {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }
        }
        @media (min-width: 640px) {
          .grid {
            grid-template-columns: repeat(7, minmax(0, 1fr));
          }
        }
        @media (min-width: 768px) {
          .grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          .grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
        @media (min-width: 1280px) {
          .grid {
            grid-template-columns: repeat(10, minmax(0, 1fr));
          }
        }
        @media (min-width: 1536px) {
          .grid {
            grid-template-columns: repeat(15, minmax(0, 1fr));
          }
        }
        "
      `)
  })

  test('var style class', async () => {
    const result = await transform(
      `nav {
        --at-apply: border;

        ul {
          li {
            --at-apply: border;
          }
        }
        a {
          --at-apply: px-2;
          --at-apply: "hover:underline";
        }
      }`,
    )
    expect(result)
      .toMatchInlineSnapshot(`
        "nav {
          border-width: 1px;
          border-style: solid;

          ul {
            li {
              border-width: 1px;
              border-style: solid;
            }
          }
          a {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
          a:hover {
            text-decoration-line: underline;
          }
        }
        "
      `)
  })

  describe('theme()', () => {
    test('basic', async () => {
      const result = await transform(
        `.btn { 
          background-color: theme("colors.blue.500");
          padding: theme("spacing.xs") theme("spacing.sm");
        }
        .btn-2 {
          height: calc(100vh - theme('spacing.sm'));
        }`,
      )
      expect(result)
        .toMatchInlineSnapshot(`
          ".btn {
            background-color: #3b82f6;
            padding: 0.75rem 0.875rem;
          }
          .btn-2 {
            height: calc(100vh - 0.875rem);
          }
          "
        `)
    })

    test('non-exist', async () => {
      expect(async () => await transform(
        `.btn { 
        color: theme("color.none.500");
        }`,
      )).rejects
        .toMatchInlineSnapshot('[Error: theme of "color.none.500" did not found]')

      expect(async () => await transform(
          `.btn { 
          font-size: theme("size.lg");
          }`,
      )).rejects
        .toMatchInlineSnapshot('[Error: theme of "size.lg" did not found]')
    })

    test('args', async () => {
      expect(async () => await transform(
        `.btn { 
          color: theme();
        }`,
      )).rejects
        .toMatchInlineSnapshot('[Error: theme() expect exact one argument, but got 0]')
    })

    test('with @apply', async () => {
      expect(await transform(`
        div {
          @apply flex h-full w-full justify-center items-center;

          --my-color: theme('colors.red.500');
          color: var(--my-color);
        }`,
      )).toMatchInlineSnapshot(`
        "div {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          --my-color: #ef4444;
          color: var(--my-color);
        }
        "
      `)
    })
  })

  test('escape backslash', async () => {
    const result = await transform(
      '.btn { @apply border-r-\$theme-color }',
    )
    expect(result)
      .toMatchInlineSnapshot(`
        ".btn {
          border-right-color: var(--theme-color);
        }
        "
      `)
  })

  test('@apply with colon', async () => {
    const result = await transform(
      '.btn { @apply: rounded text-lg font-mono }',
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
})
