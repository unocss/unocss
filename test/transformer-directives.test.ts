import type { UnoGenerator } from '@unocss/core'
import { readFile } from 'node:fs/promises'
import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import MagicString from 'magic-string'
import parserHTML from 'prettier/parser-html'
import parserCSS from 'prettier/parser-postcss'
import prettier from 'prettier/standalone'
import { describe, expect, it } from 'vitest'
import { transformDirectives } from '../packages/transformer-directives/src/transform'

interface DirectiveParseContextConfig {
  name: 'css' | 'embed'
  cssTemplate: (code: string) => string
}

describe.each<DirectiveParseContextConfig>([
  {
    name: 'css',
    cssTemplate: (code: string) => code,
  },
  {
    name: 'embed',
    cssTemplate: code => `<style>${code}</style>`,
  },
])('transformer-directives-$name', ({ name, cssTemplate }) => {
  const snapshotPathPrefix = (name: DirectiveParseContextConfig['name']) =>
    `./assets/output/transformer-directives${name === 'css' ? '' : `-${name}`}-`
  const snapshotPath = (name: DirectiveParseContextConfig['name'], task: string) => {
    const formattedTask = task.split(/\s+/).filter(Boolean).join('-')
    return `${snapshotPathPrefix(name)}${formattedTask}.css`
  }

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

  function format(code: string) {
    return prettier.format(code, {
      parser: name === 'embed' ? 'html' : 'css',
      plugins: [...(name === 'embed' ? [parserHTML] : []), parserCSS],
      embeddedLanguageFormatting: 'auto',
    })
  }

  async function transform(code: string, _uno: UnoGenerator = uno) {
    const s = new MagicString(cssTemplate(code))
    await transformDirectives(s, _uno, {})
    return format(s.toString())
  }

  it('basic', async ({ task }) => {
    const result = await transform(`.btn {
        @apply rounded text-lg;
        @apply 'font-mono';
      }`,
    )
    await expect(result).toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('breakpoints', async ({ task }) => {
    const result = await transform(
      '.grid { @apply grid grid-cols-2 xl:grid-cols-10 sm:grid-cols-7 md:grid-cols-3 lg:grid-cols-4 }',
    )
    await expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('variant group', async ({ task }) => {
    const result = await transform(
      '.btn { @apply grid-(cols-2 rows-4) hover:(border bg-white) }',
    )
    await expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('pseudo-classes', async ({ task }) => {
    const result = await transform(
      '.btn { @apply p-3 hover:bg-white focus:border }',
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('multiple pseudo-classes', async ({ task }) => {
    const result = await transform(
      '.btn { @apply sm:hover:bg-white }',
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('element selector', async ({ task }) => {
    const result = await transform(
      'input { @apply px-3 focus:border; }',
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('multiple selector', async ({ task }) => {
    const result = await transform(
      '.btn,.box { @apply px-3 focus:border; }',
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('two class selector', async ({ task }) => {
    const result = await transform(
      '.btn.box { @apply px-3 focus:border; }',
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('multiple apply', async ({ task }) => {
    const result = await transform(
      `.btn {
        @apply p-3;
        @apply bg-white;
        @apply hover:bg-blue-500;
        @apply hover:border;
      }`,
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  // #3794
  it('multiple apply ignore comments', async ({ task }) => {
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
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('dark class', async ({ task }) => {
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
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('nested class', async ({ task }) => {
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
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('css file', async ({ task }) => {
    const css = await readFile('./test/assets/apply.css', 'utf8')
    const result = await transform(css)

    await expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('custom breakpoints', async ({ task }) => {
    const result = await transform('.grid { @apply grid grid-cols-2 xs:grid-cols-1 xxl:grid-cols-15 xl:grid-cols-10 sm:grid-cols-7 md:grid-cols-3 lg:grid-cols-4 }')
    await expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('var style class', async ({ task }) => {
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
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('multiple apply in one class', async ({ task }) => {
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
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('declaration for apply variable', async ({ task }) => {
    const result = await transform(
      `nav {
        --uno: b-#fff bg-black/5 fw-600 text-teal/7 'shadow-red:80';
      }`,
    )

    expect(result).toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('@screen basic', async ({ task }) => {
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
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('@screen lt variant', async ({ task }) => {
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
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('@screen at variant', async ({ task }) => {
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
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('@screen with compression', async ({ task }) => {
    const result = await transform(`@screen md{#__page{--uno:px-4}}`)
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  describe('theme()', () => {
    it('theme-basic', async ({ task }) => {
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
        .toMatchFileSnapshot(snapshotPath(name, task.name))
    })

    it('non-exist', async () => {
      expect(async () => await transform(
        `.btn {
        color: theme("color.none.500");
        }`,
      )).rejects.toThrowError('theme of "color.none.500" did not found')

      expect(async () => await transform(
        `.btn {
          font-size: theme("size.lg");
          }`,
      )).rejects.toThrowError('theme of "size.lg" did not found')
    })

    it('args', async () => {
      expect(async () => await transform(
        `.btn {
          color: theme();
        }`,
      )).rejects.toThrowError('theme() expect exact one argument')
    })

    it('with @apply', async ({ task }) => {
      const result = await transform(`
div {
  @apply flex h-full w-full justify-center items-center;

  --my-color: theme('colors.red.500');
  color: var(--my-color);
}`)
      expect(result).toMatchFileSnapshot(snapshotPath(name, task.name))
    })

    it('opacity', async ({ task }) => {
      const result = await transform(`
        div {
          color: theme('colors.red.500 / 50%');
          color: theme('colors.rgb / 0.5');
          color: theme('colors.rgba / 50%');
          color: theme('colors.hsl / 0.6');
          color: theme('colors.hsla / 60%');
        }`)
      expect(result).toMatchFileSnapshot(snapshotPath(name, task.name))
    })
  })

  it('escape backslash', async ({ task }) => {
    const result = await transform(
      '.btn { @apply border-r-\$theme-color }',
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('@apply with colon', async ({ task }) => {
    const result = await transform(
      '.btn { @apply: rounded text-lg font-mono }',
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('@apply animate- scoped', async ({ task }) => {
    const result = await transform(
      '.btn { @apply: animate-pulse }',
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('@apply selector group', async ({ task }) => {
    const result = await transform(
      '.btn { @apply: sgroup:bg-orange }',
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('--at-apply with colon in value', async ({ task }) => {
    const result = await transform(
      `.v-popper--theme-dropdown .v-popper__inner,
      .v-popper--theme-tooltip .v-popper__inner {
        --at-apply: text-green dark:text-red;
        box-shadow: 0 6px 30px #0000001a;
      }`,
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })
})

describe.each<DirectiveParseContextConfig>([
  {
    name: 'css',
    cssTemplate: (code: string) => code,
  },
  {
    name: 'embed',
    cssTemplate: code => `<style>${code}</style>`,
  },
])('transformer-directives-$name with important', ({ name, cssTemplate }) => {
  const snapshotPathPrefix = (name: DirectiveParseContextConfig['name']) =>
    `./assets/output/transformer-directives-${name === 'css' ? '' : `${name}-`}with-important-`
  const snapshotPath = (name: DirectiveParseContextConfig['name'], task: string) => {
    const formattedTask = task.split(/\s+/).filter(Boolean).join('-')
    return `${snapshotPathPrefix(name)}${formattedTask}.css`
  }
  const uno = createGenerator({
    presets: [
      presetUno({
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

  function format(code: string) {
    return prettier.format(code, {
      parser: name === 'embed' ? 'html' : 'css',
      plugins: [...(name === 'embed' ? [parserHTML] : []), parserCSS],
      embeddedLanguageFormatting: 'auto',
    })
  }

  async function transform(code: string, _uno: UnoGenerator = uno) {
    const s = new MagicString(cssTemplate(code))
    await transformDirectives(s, _uno, {})
    return format(s.toString())
  }

  it('basic', async ({ task }) => {
    const result = await transform(
      `.btn {
        @apply rounded text-lg;
        @apply 'font-mono';
      }`,
    )

    expect(result).toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('breakpoints', async ({ task }) => {
    const result = await transform(
      '.grid { @apply grid grid-cols-2 xl:grid-cols-10 sm:grid-cols-7 md:grid-cols-3 lg:grid-cols-4 }',
    )
    await expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('variant group', async ({ task }) => {
    const result = await transform(
      '.btn { @apply grid-(cols-2 rows-4) hover:(border bg-white) }',
    )
    await expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('pseudo-classes', async ({ task }) => {
    const result = await transform(
      '.btn { @apply p-3 hover:bg-white focus:border }',
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('multiple pseudo-classes', async ({ task }) => {
    const result = await transform(
      '.btn { @apply sm:hover:bg-white }',
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('element selector', async ({ task }) => {
    const result = await transform(
      'input { @apply px-3 focus:border; }',
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('multiple selector', async ({ task }) => {
    const result = await transform(
      '.btn,.box { @apply px-3 focus:border; }',
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('two class selector', async ({ task }) => {
    const result = await transform(
      '.btn.box { @apply px-3 focus:border; }',
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('multiple apply', async ({ task }) => {
    const result = await transform(
      `.btn {
        @apply p-3;
        @apply bg-white;
        @apply hover:bg-blue-500;
        @apply hover:border;
      }`,
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  // #3794
  it('multiple apply ignore comments', async ({ task }) => {
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
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  // todo: fix the test
  it('nested class', async ({ task }) => {
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
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('css file', async ({ task }) => {
    const css = await readFile('./test/assets/apply.css', 'utf8')
    const result = await transform(css)

    await expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('custom breakpoints', async ({ task }) => {
    const result = await transform('.grid { @apply grid grid-cols-2 xs:grid-cols-1 xxl:grid-cols-15 xl:grid-cols-10 sm:grid-cols-7 md:grid-cols-3 lg:grid-cols-4 }')
    await expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('var style class', async ({ task }) => {
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
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('declaration for apply variable', async ({ task }) => {
    const result = await transform(
      `nav {
        --uno: b-#fff bg-black/5 fw-600 text-teal/7 'shadow-red:80';
      }`,
    )

    expect(result).toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('@screen basic', async ({ task }) => {
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
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('@screen lt variant', async ({ task }) => {
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
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('@screen at variant', async ({ task }) => {
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
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  describe('theme()', () => {
    it('theme-basic', async ({ task }) => {
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
        .toMatchFileSnapshot(snapshotPath(name, task.name))
    })

    it('non-exist', async () => {
      expect(async () => await transform(
        `.btn {
        color: theme("color.none.500");
        }`,
      )).rejects.toThrowError(`theme of "color.none.500" did not found`)

      expect(async () => await transform(
        `.btn {
          font-size: theme("size.lg");
          }`,
      )).rejects.toThrowError(`theme of "size.lg" did not found`)
    })

    it('args', async () => {
      expect(async () => await transform(
        `.btn {
          color: theme();
        }`,
      )).rejects.toThrowError(`theme() expect exact one argument`)
    })

    it('with @apply', async ({ task }) => {
      const result = await transform(`
div {
  @apply flex h-full w-full justify-center items-center;

  --my-color: theme('colors.red.500');
  color: var(--my-color);
}`)
      expect(result).toMatchFileSnapshot(snapshotPath(name, task.name))
    })

    it('opacity', async ({ task }) => {
      const result = await transform(`
        div {
          color: theme('colors.red.500 / 50%');
          color: theme('colors.rgb / 0.5');
          color: theme('colors.rgba / 50%');
          color: theme('colors.hsl / 0.6');
          color: theme('colors.hsla / 60%');
        }`)
      expect(result).toMatchFileSnapshot(snapshotPath(name, task.name))
    })

    it('color with DEFAULT', async ({ task }) => {
      const result = await transform(`
        div {
          color: theme('colors.primary');
          color: theme('colors.primary.DEFAULT');
          color: theme('colors.primary / 50%');
          color: theme('colors.primary.500');
        }`)

      expect(result).toMatchFileSnapshot(snapshotPath(name, task.name))
    })
  })

  it('escape backslash', async ({ task }) => {
    const result = await transform(
      '.btn { @apply border-r-\$theme-color }',
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('@apply with colon', async ({ task }) => {
    const result = await transform(
      '.btn { @apply: rounded text-lg font-mono }',
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('@apply animate- scoped', async ({ task }) => {
    const result = await transform(
      '.btn { @apply: animate-pulse }',
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('@apply selector group', async ({ task }) => {
    const result = await transform(
      '.btn { @apply: sgroup:bg-orange }',
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })

  it('--at-apply with colon in value', async ({ task }) => {
    const result = await transform(
      `.v-popper--theme-dropdown .v-popper__inner,
      .v-popper--theme-tooltip .v-popper__inner {
        --at-apply: text-green dark:text-red;
        box-shadow: 0 6px 30px #0000001a;
      }`,
    )
    expect(result)
      .toMatchFileSnapshot(snapshotPath(name, task.name))
  })
})
