import type { UnoGenerator } from '@unocss/core'
import type { IconsOptions } from '@unocss/preset-icons'
import { readFile } from 'node:fs/promises'
import { createGenerator, mergeDeep } from '@unocss/core'
import presetIcons from '@unocss/preset-icons'
import presetWind3 from '@unocss/preset-wind3'
import presetWind4 from '@unocss/preset-wind4'
import MagicString from 'magic-string'
import parserCSS from 'prettier/parser-postcss'
import prettier from 'prettier/standalone'
import { describe, expect, it } from 'vitest'
import { transformDirectives } from '../packages-presets/transformer-directives/src/transform'

describe('wind3', () => {
  describe('transformer-directives', async () => {
    const uno = await createGenerator({
      presets: [
        presetWind3({
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

    it('basic #4606', async () => {
      const result = await transform(
        `body {
    @apply sm:lg:md:xs:w-[40em];
  }`,
      )
      await expect(result)
        .toMatchInlineSnapshot(`
          "@media (min-width: 640px) {
            @media (min-width: 1024px) {
              @media (min-width: 768px) {
                @media (min-width: 320px) {
                  body {
                    width: 40em;
                  }
                }
              }
            }
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
        "@media (min-width: 640px) {
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
      const uno = await createGenerator({
        presets: [
          presetWind3({
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

    it('multiple apply in one class', async () => {
      const result = await transform(
        `nav {
        --at-apply: border font-mono text-lg;
        
        .test-a {
          @apply shadow-lg;@apply rounded-md bg-slate-300 shadow-amber-500;
        }
        .test-b {
          @apply shadow-lg;font-size:20px;@apply rounded-md bg-slate-300 shadow-amber-500;
        }
        a {
          --at-apply: px-2;
          --uno: "hover:underline";
        }
      }`,
      )

      await expect(result)
        .toMatchFileSnapshot('./assets/output/transformer-directives-multiple-apply-in-one-class.css')
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

    it('@screen with compression', async () => {
      const result = await transform(`@screen md{#__page{--uno:px-4}}`)
      await expect(result)
        .toMatchInlineSnapshot(`
        "@media (min-width: 768px) {
          #__page {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
        "
      `)
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
        await expect(async () => await transform(
          `.btn {
        color: theme("color.none.500");
        }`,
        )).rejects.toMatchInlineSnapshot(`[Error: theme of "color.none.500" did not found]`)

        await expect(async () => await transform(
          `.btn {
          font-size: theme("size.lg");
          }`,
        )).rejects.toMatchInlineSnapshot(`[Error: theme of "size.lg" did not found]`)
      })

      it('args', async () => {
        await expect(async () => await transform(
          `.btn {
          color: theme();
        }`,
        )).rejects.toMatchInlineSnapshot(`[Error: theme() expect exact one argument]`)
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

    it('@apply with empty block comments', async () => {
      const result = await transform(
        `
.aaa {
  @apply text-blue-500;
  /* {} empty curly brace in comment will lead to wrong parsing */
  font-weight: 900;
}
      `,
      )
      expect(result)
        .toMatchInlineSnapshot(`
        ".aaa {
          --un-text-opacity: 1;
          color: rgb(59 130 246 / var(--un-text-opacity));
          /* {} empty curly brace in comment will lead to wrong parsing */
          font-weight: 900;
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
        ".btn:hover,
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

  describe('transformer-directives with important', async () => {
    const uno = await createGenerator({
      presets: [
        presetWind3({
          dark: 'media',
          important: '#app',
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
          primary: {
            500: '#222',
            DEFAULT: '#ccc',
          },
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
        "#app :is(.btn) {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
        }
        #app :is(.btn) {
          border-radius: 0.25rem;
          font-size: 1.125rem;
          line-height: 1.75rem;
        }
        "
      `)
    })

    it('breakpoints', async () => {
      const result = await transform(
        '.grid { @apply grid grid-cols-2 xl:grid-cols-10 sm:grid-cols-7 md:grid-cols-3 lg:grid-cols-4 }',
      )
      await expect(result)
        .toMatchFileSnapshot('./assets/output/transformer-directives-breakpoints-with-important.css')
    })

    it('variant group', async () => {
      const result = await transform(
        '.btn { @apply grid-(cols-2 rows-4) hover:(border bg-white) }',
      )
      await expect(result)
        .toMatchFileSnapshot('./assets/output/transformer-directives-variant-group-with-important.css')
    })

    it('pseudo-classes', async () => {
      const result = await transform(
        '.btn { @apply p-3 hover:bg-white focus:border }',
      )
      expect(result)
        .toMatchInlineSnapshot(`
        "#app :is(.btn:focus) {
          border-width: 1px;
        }
        #app :is(.btn:hover) {
          --un-bg-opacity: 1;
          background-color: rgb(255 255 255 / var(--un-bg-opacity));
        }
        #app :is(.btn) {
          padding: 0.75rem;
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
        "@media (min-width: 640px) {
          #app :is(.btn:hover) {
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
        "#app :is(input:focus) {
          border-width: 1px;
        }
        #app :is(input) {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
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
        "#app :is(.btn, .box:focus),
        #app :is(.btn, .box:focus) {
          border-width: 1px;
        }
        #app :is(.btn, .box),
        #app :is(.btn, .box) {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
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
        "#app :is(.btn.box:focus) {
          border-width: 1px;
        }
        #app :is(.btn.box) {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
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
        "#app :is(.btn) {
          padding: 0.75rem;
        }
        #app :is(.btn:hover) {
          border-width: 1px;
        }
        #app :is(.btn) {
          --un-bg-opacity: 1;
          background-color: rgb(255 255 255 / var(--un-bg-opacity));
        }
        #app :is(.btn:hover) {
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
        "#app :is(.btn) {
          --un-bg-opacity: 1;
          background-color: rgb(255 255 255 / var(--un-bg-opacity));
        }
        #app :is(.btn:hover) {
          --un-bg-opacity: 1;
          background-color: rgb(59 130 246 / var(--un-bg-opacity));
        }
        #app :is(.btn:hover) {
          border-width: 1px;
        }
        #app :is(.btn) {
          margin: 1rem;
          padding: 0.75rem;
          text-align: center;
        }
        "
      `)
    })

    // todo: fix the test
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
            #app :is(li) {
              border-width: 1px;
            }
          }
          #app :is(a) {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
          #app :is(a:hover) {
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
        .toMatchFileSnapshot('./assets/output/transformer-directives-apply-with-important.css')
    })

    it('custom breakpoints', async () => {
      const result = await transform('.grid { @apply grid grid-cols-2 xs:grid-cols-1 xxl:grid-cols-15 xl:grid-cols-10 sm:grid-cols-7 md:grid-cols-3 lg:grid-cols-4 }')
      await expect(result)
        .toMatchFileSnapshot('./assets/output/transformer-directives-custom-breakpoints-with-important.css')
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
        .toMatchFileSnapshot('./assets/output/transformer-directives-var-style-class-with-important.css')
    })

    it('declaration for apply variable', async () => {
      const result = await transform(
        `nav {
        --uno: b-#fff bg-black/5 fw-600 text-teal/7 'shadow-red:80';
      }`,
      )

      expect(result).toMatchInlineSnapshot(`
      "nav {
      }
      #app :is(nav) {
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
        .toMatchFileSnapshot('./assets/output/transformer-directives-at-screen-with-important.css')
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
        .toMatchFileSnapshot('./assets/output/transformer-directives-screen-lt-with-important.css')
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
        .toMatchFileSnapshot('./assets/output/transformer-directives-screen-at-with-important.css')
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
        await expect(async () => await transform(
          `.btn {
        color: theme("color.none.500");
        }`,
        )).rejects.toMatchInlineSnapshot(`[Error: theme of "color.none.500" did not found]`)

        await expect(async () => await transform(
          `.btn {
          font-size: theme("size.lg");
          }`,
        )).rejects.toMatchInlineSnapshot(`[Error: theme of "size.lg" did not found]`)
      })

      it('args', async () => {
        await expect(async () => await transform(
          `.btn {
          color: theme();
        }`,
        )).rejects.toMatchInlineSnapshot(`[Error: theme() expect exact one argument]`)
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
          --my-color: #ef4444;
          color: var(--my-color);
        }
        #app :is(div) {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
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

      it('color with DEFAULT', async () => {
        const result = await transform(`
        div {
          color: theme('colors.primary');
          color: theme('colors.primary.DEFAULT');
          color: theme('colors.primary / 50%');
          color: theme('colors.primary.500');
        }`)

        expect(result).toMatchInlineSnapshot(`
        "div {
          color: #ccc;
          color: #ccc;
          color: rgb(204 204 204 / 50%);
          color: #222;
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
        "#app :is(.btn) {
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
        "#app :is(.btn) {
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
        "#app :is(.btn) {
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
        "#app :is(.btn:hover, .btn:focus) {
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
          box-shadow: 0 6px 30px #0000001a;
        }
        #app
          :is(
            .v-popper--theme-dropdown .v-popper__inner,
            .v-popper--theme-tooltip .v-popper__inner
          ),
        #app
          :is(
            .v-popper--theme-dropdown .v-popper__inner,
            .v-popper--theme-tooltip .v-popper__inner
          ) {
          --un-text-opacity: 1;
          color: rgb(74 222 128 / var(--un-text-opacity));
        }
        @media (prefers-color-scheme: dark) {
          #app
            :is(
              .v-popper--theme-dropdown .v-popper__inner,
              .v-popper--theme-tooltip .v-popper__inner
            ),
          #app
            :is(
              .v-popper--theme-dropdown .v-popper__inner,
              .v-popper--theme-tooltip .v-popper__inner
            ) {
            --un-text-opacity: 1;
            color: rgb(248 113 113 / var(--un-text-opacity));
          }
        }
        "
      `)
    })
  })

  describe('icon directive', () => {
    function createUno(iconsOptions?: IconsOptions) {
      const defaultOptions = {
        collections: {
          ph: {
            check: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentcolor" viewBox="0 0 24 24"><path d="ph:check"/></svg>`,
          },
        },
      }

      return createGenerator({
        presets: [
          presetWind3(),
          presetIcons(mergeDeep(defaultOptions, iconsOptions ?? {})),
        ],
      })
    }

    async function transform(code: string, _uno: UnoGenerator) {
      const s = new MagicString(code)
      await transformDirectives(s, _uno, {})
      return prettier.format(s.toString(), {
        parser: 'css',
        plugins: [parserCSS],
      })
    }

    it('icon()', async () => {
      const uno = await createUno()

      const result = await transform(
        `.icon {
          background-image: icon('i-ph-check');
          background-image: icon('i-ph:check', '#fff') no-repeat;
          background-image: icon('i-ph:check', 'theme("colors.red.500")');
          background-image: icon('i-carbon-sun');
        }`,
        uno,
      )

      expect(result).toMatchInlineSnapshot(`
      ".icon {
        background-image: url("data:image/svg+xml;utf8,%3Csvg width='1em' height='1em' xmlns='http://www.w3.org/2000/svg' fill='currentcolor' viewBox='0 0 24 24'%3E%3Cpath d='ph:check'/%3E%3C/svg%3E");
        background-image: url("data:image/svg+xml;utf8,%3Csvg width='1em' height='1em' xmlns='http://www.w3.org/2000/svg' fill='%23fff' viewBox='0 0 24 24'%3E%3Cpath d='ph:check'/%3E%3C/svg%3E")
          no-repeat;
        background-image: url("data:image/svg+xml;utf8,%3Csvg width='1em' height='1em' xmlns='http://www.w3.org/2000/svg' fill='%23ef4444' viewBox='0 0 24 24'%3E%3Cpath d='ph:check'/%3E%3C/svg%3E");
        background-image: url("data:image/svg+xml;utf8,%3Csvg viewBox='0 0 32 32' width='1em' height='1em' xmlns='http://www.w3.org/2000/svg' %3E%3Cpath fill='currentColor' d='M16 12.005a4 4 0 1 1-4 4a4.005 4.005 0 0 1 4-4m0-2a6 6 0 1 0 6 6a6 6 0 0 0-6-6M5.394 6.813L6.81 5.399l3.505 3.506L8.9 10.319zM2 15.005h5v2H2zm3.394 10.193L8.9 21.692l1.414 1.414l-3.505 3.506zM15 25.005h2v5h-2zm6.687-1.9l1.414-1.414l3.506 3.506l-1.414 1.414zm3.313-8.1h5v2h-5zm-3.313-6.101l3.506-3.506l1.414 1.414l-3.506 3.506zM15 2.005h2v5h-2z'/%3E%3C/svg%3E");
      }
      "
    `)
    })

    it('icon() without extra properties', async () => {
      const uno = await createUno({
        extraProperties: {
          'display': 'inline-block',
          'vertical-align': 'middle',
        },
      })

      const result = await transform(
        `.icon {
          background-image: icon('i-ph-check');
        }`,
        uno,
      )

      expect(result).not.toContain(`display='inline-block'`)
      expect(result).not.toContain(`vertical-align='middle'`)
    })
  })
})

describe('wind4', () => {
  describe('transformer-directives', async () => {
    const uno = await createGenerator({
      presets: [
        presetWind4(),
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
            font-size: var(--text-lg-fontSize);
            line-height: var(--un-leading, var(--text-lg-lineHeight));
            border-radius: var(--radius-DEFAULT);
            font-family: var(--font-mono);
          }
          "
        `)
    })

    it('theme()', async () => {
      const result = await transform(
        `.btn {
          color: theme('colors.red.500');
        }`,
      )

      await expect(result)
        .toMatchInlineSnapshot(`
          ".btn {
            color: oklch(63.7% 0.237 25.331);
          }
          "
        `)
    })

    it('border opacity', async () => {
      const result = await transform(
        `.btn {
          --at-apply: border-red-500 text-red-500;
        }`,
      )

      await expect(result)
        .toMatchInlineSnapshot(`
          ".btn {
            color: color-mix(
              in srgb,
              var(--colors-red-500) var(--un-text-opacity),
              transparent
            );
            border-color: color-mix(
              in srgb,
              var(--colors-red-500) var(--un-border-opacity),
              transparent
            );
          }
          @property --un-text-opacity {
            syntax: "<percentage>";
            inherits: false;
            initial-value: 100%;
          }
          @supports (color: color-mix(in lab, red, red)) {
            .btn {
              color: color-mix(
                in oklab,
                var(--colors-red-500) var(--un-text-opacity),
                transparent
              );
              border-color: color-mix(
                in oklab,
                var(--colors-red-500) var(--un-border-opacity),
                transparent
              );
            }
          }
          @property --un-border-opacity {
            syntax: "<percentage>";
            inherits: false;
            initial-value: 100%;
          }
          "
        `)
    })
  })

  describe('transformer screen', async () => {
    const uno = await createGenerator({
      presets: [
        presetWind4(),
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
      const result = await transform(`
@screen sm {
  .grid {
    @apply grid-cols-1;
  }
}
@screen at-lg {
  .grid {
    @apply grid-cols-3;
  }
}
@screen lt-xl {
  .grid {
    @apply grid-cols-4;
  }
}
`)
      await expect(result)
        .toMatchInlineSnapshot(`
          "@media (min-width: 40rem) {
            .grid {
              grid-template-columns: repeat(1, minmax(0, 1fr));
            }
          }
          @media (min-width: 64rem) and (max-width: calc(80rem - 0.1px)) {
            .grid {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          }
          @media (max-width: calc(80rem - 0.1px)) {
            .grid {
              grid-template-columns: repeat(4, minmax(0, 1fr));
            }
          }
          "
        `)
    })
  })
})
