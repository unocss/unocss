import { readFile } from 'node:fs/promises'
import type { UnoGenerator } from '@unocss/core'
import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import MagicString from 'magic-string'
import parserCSS from 'prettier/parser-postcss'
import prettier from 'prettier/standalone'
import { describe, expect, it } from 'vitest'
import { transformDirectives } from '../packages/transformer-directives/src/transform'

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
    theme: {
      colors: {
        hsl: 'hsl(210, 50%, 50%)',
        hsla: 'hsl(210, 50%, 50%, )',
        rgb: 'rgb(255, 0, 0)',
        rgba: 'rgba(255 0 0 / 0.5)',
      },
      breakpoints: {
        xs: '320px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        xxl: '1536px',
      },
    },
    variants: [
      (matcher) => {
        const prefix = 'sgroup:' // selector group

        if (!matcher.startsWith(prefix))
          return matcher

        return {
          matcher: matcher.slice(prefix.length),
          selector: s => `${s}:hover, ${s}:focus`,
        }
      },
    ],
  })

  async function transform(code: string, _uno: UnoGenerator = uno) {
    const s = new MagicString(code)
    await transformDirectives(s, _uno, {})
    return prettier.format(s.toString(), {
      parser: 'css',
      plugins: [parserCSS],
    })
  }

  it('basic', async () => {
    const result = await transform(
      `.btn {
        @apply rounded text-lg;
        @apply 'font-mono';
      }`,
    )
    await expect(result)
      .toMatchInlineSnapshot(`
        ".btn {
          border-radius: 0.25rem;
          font-size: 1.125rem;
          line-height: 1.75rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
        }
        "
      `)
  })

  it('breakpoints', async () => {
    const result = await transform(
      '.grid { @apply grid grid-cols-2 xl:grid-cols-10 sm:grid-cols-7 md:grid-cols-3 lg:grid-cols-4 }',
    )
    await expect(result)
      .toMatchFileSnapshot('./assets/output/transformer-directives-breakpoints.css')
  })

  it('variant group', async () => {
    const result = await transform(
      '.btn { @apply grid-(cols-2 rows-4) hover:(border bg-white) }',
    )
    await expect(result)
      .toMatchFileSnapshot('./assets/output/transformer-directives-variant-group.css')
  })

  it('pseudo-classes', async () => {
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
        }
        .btn:hover {
          --un-bg-opacity: 1;
          background-color: rgb(255 255 255 / var(--un-bg-opacity));
        }
        "
      `)
  })

  it('multiple pseudo-classes', async () => {
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
            background-color: rgb(255 255 255 / var(--un-bg-opacity));
          }
        }
        "
      `)
  })

  it('element selector', async () => {
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
        }
        "
      `)
  })

  it('multiple selector', async () => {
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
        }
        "
      `)
  })

  it('two class selector', async () => {
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
        }
        "
      `)
  })

  it('multiple apply', async () => {
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
          background-color: rgb(255 255 255 / var(--un-bg-opacity));
        }
        .btn:hover {
          border-width: 1px;
        }
        .btn:hover {
          --un-bg-opacity: 1;
          background-color: rgb(59 130 246 / var(--un-bg-opacity));
        }
        "
      `)
  })

  // #3794
  it('multiple apply ignore comments', async () => {
    const result = await transform(
      `.btn {
        @apply p-3 m-4 /* overflow-hidden */ /*bg-white*/ // bg-black
        text-center // w-2
        ;
        @apply bg-white;
        @apply hover:bg-blue-500 /* m-4 */;
        @apply hover:border;
      }`,
    )
    expect(result)
      .toMatchInlineSnapshot(`
        ".btn {
          margin: 1rem;
          padding: 0.75rem;
          text-align: center;
          --un-bg-opacity: 1;
          background-color: rgb(255 255 255 / var(--un-bg-opacity));
        }
        .btn:hover {
          --un-bg-opacity: 1;
          background-color: rgb(59 130 246 / var(--un-bg-opacity));
        }
        .btn:hover {
          border-width: 1px;
        }
        "
      `)
  })

  it('dark class', async () => {
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
          background-color: rgb(255 255 255 / var(--un-bg-opacity));
        }
        .dark .btn {
          --un-bg-opacity: 1;
          background-color: rgb(0 0 0 / var(--un-bg-opacity));
        }
        "
      `)
  })

  it('nested class', async () => {
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

  it('css file', async () => {
    const css = await readFile('./test/assets/apply.css', 'utf8')
    const result = await transform(css)

    await expect(result)
      .toMatchFileSnapshot('./assets/output/transformer-directives-apply.css')
  })

  it('custom breakpoints', async () => {
    const result = await transform('.grid { @apply grid grid-cols-2 xs:grid-cols-1 xxl:grid-cols-15 xl:grid-cols-10 sm:grid-cols-7 md:grid-cols-3 lg:grid-cols-4 }')
    await expect(result)
      .toMatchFileSnapshot('./assets/output/transformer-directives-custom-breakpoints.css')
  })

  it('var style class', async () => {
    const result = await transform(
      `nav {
        --at-apply: border font-mono text-lg;

        ul {
          li {
            --uno-apply: border;
          }
        }
        a {
          --at-apply: px-2;
          --uno: "hover:underline";
        }
      }`,
    )

    await expect(result)
      .toMatchFileSnapshot('./assets/output/transformer-directives-var-style-class.css')
  })

  it('declaration for apply variable', async () => {
    const result = await transform(
      `nav {
        --uno: b-#fff bg-black/5 fw-600 text-teal/7 'shadow-red:80';
      }`,
    )

    expect(result).toMatchInlineSnapshot(`
      "nav {
        --un-border-opacity: 1;
        border-color: rgb(255 255 255 / var(--un-border-opacity));
        background-color: rgb(0 0 0 / 0.05);
        color: rgb(45 212 191 / 0.07);
        font-weight: 600;
        --un-shadow-color: rgb(248 113 113 / 0.8);
      }
      "
    `)
  })

  it('@screen basic', async () => {
    const result = await transform(`
.grid {
  @apply grid grid-cols-2;
}
@screen xs {
  .grid {
    @apply grid-cols-1;
  }
}
@screen sm {
  .grid {
    @apply grid-cols-3;
  }
}
@screen md {
  .grid {
    @apply grid-cols-4;
  }
}
@screen lg {
  .grid {
    @apply grid-cols-5;
  }
}
@screen xl {
  .grid {
    @apply grid-cols-6;
  }
}
@screen xxl {
  .grid {
    @apply grid-cols-7;
  }
}
`)
    await expect(result)
      .toMatchFileSnapshot('./assets/output/transformer-directives-at-screen.css')
  })

  it('@screen lt variant', async () => {
    const result = await transform(`
.grid {
  @apply grid grid-cols-2;
}
@screen lt-xs {
  .grid {
    @apply grid-cols-1;
  }
}
@screen lt-sm {
  .grid {
    @apply grid-cols-3;
  }
}
@screen lt-md {
  .grid {
    @apply grid-cols-4;
  }
}
`)
    await expect(result)
      .toMatchFileSnapshot('./assets/output/transformer-directives-screen-lt.css')
  })

  it('@screen at variant', async () => {
    const result = await transform(`
  .grid {
    @apply grid grid-cols-2;
  }
  @screen at-xs {
    .grid {
      @apply grid-cols-1;
    }
  }
  @screen at-xl {
    .grid {
      @apply grid-cols-3;
    }
  }
  @screen at-xxl {
    .grid {
      @apply grid-cols-4;
    }
  }
`)
    await expect(result)
      .toMatchFileSnapshot('./assets/output/transformer-directives-screen-at.css')
  })

  describe('theme()', () => {
    it('basic', async () => {
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

    it('non-exist', async () => {
      expect(async () => await transform(
        `.btn {
        color: theme("color.none.500");
        }`,
      )).rejects
        .toMatchInlineSnapshot(`[Error: theme of "color.none.500" did not found]`)

      expect(async () => await transform(
          `.btn {
          font-size: theme("size.lg");
          }`,
      )).rejects
        .toMatchInlineSnapshot(`[Error: theme of "size.lg" did not found]`)
    })

    it('args', async () => {
      expect(async () => await transform(
        `.btn {
          color: theme();
        }`,
      )).rejects
        .toMatchInlineSnapshot(`[Error: theme() expect exact one argument]`)
    })

    it('with @apply', async () => {
      const result = await transform(`
div {
  @apply flex h-full w-full justify-center items-center;

  --my-color: theme('colors.red.500');
  color: var(--my-color);
}`)
      expect(result).toMatchInlineSnapshot(`
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

    it('opacity', async () => {
      const result = await transform(`
        div {
          color: theme('colors.red.500 / 50%');
          color: theme('colors.rgb / 0.5');
          color: theme('colors.rgba / 50%');
          color: theme('colors.hsl / 0.6');
          color: theme('colors.hsla / 60%');
        }`)
      expect(result).toMatchInlineSnapshot(`
        "div {
          color: rgb(239 68 68 / 50%);
          color: rgb(255 0 0 / 0.5);
          color: rgba(255, 0, 0, 50%);
          color: hsl(210 50% 50% / 0.6);
          color: hsl(210 50% 50% / 60%);
        }
        "
      `)
    })
  })

  it('escape backslash', async () => {
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

  it('@apply with colon', async () => {
    const result = await transform(
      '.btn { @apply: rounded text-lg font-mono }',
    )
    expect(result)
      .toMatchInlineSnapshot(`
        ".btn {
          border-radius: 0.25rem;
          font-size: 1.125rem;
          line-height: 1.75rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
        }
        "
      `)
  })

  it('@apply animate- scoped', async () => {
    const result = await transform(
      '.btn { @apply: animate-pulse }',
    )
    expect(result)
      .toMatchInlineSnapshot(`
        ".btn {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        "
      `)
  })

  it('@apply selector group', async () => {
    const result = await transform(
      '.btn { @apply: sgroup:bg-orange }',
    )
    expect(result)
      .toMatchInlineSnapshot(`
        ".btn {
        }
        .btn:hover,
        .btn:focus {
          --un-bg-opacity: 1;
          background-color: rgb(251 146 60 / var(--un-bg-opacity));
        }
        "
      `)
  })

  it('--at-apply with colon in value', async () => {
    const result = await transform(
      `.v-popper--theme-dropdown .v-popper__inner,
      .v-popper--theme-tooltip .v-popper__inner {
        --at-apply: text-green dark:text-red;
        box-shadow: 0 6px 30px #0000001a;
      }`,
    )
    expect(result)
      .toMatchInlineSnapshot(`
        ".v-popper--theme-dropdown .v-popper__inner,
        .v-popper--theme-tooltip .v-popper__inner {
          --un-text-opacity: 1;
          color: rgb(74 222 128 / var(--un-text-opacity));
          box-shadow: 0 6px 30px #0000001a;
        }
        @media (prefers-color-scheme: dark) {
          .v-popper--theme-dropdown .v-popper__inner,
          .v-popper--theme-tooltip .v-popper__inner {
            --un-text-opacity: 1;
            color: rgb(248 113 113 / var(--un-text-opacity));
          }
        }
        "
      `)
  })
})
