import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { format as prettier } from 'prettier'
import parserCSS from 'prettier/parser-postcss'
import { describe, expect, it } from 'vitest'
import { transformApply } from '.'

describe('transformApply', () => {
  const uno = createGenerator({
    presets: [
      presetUno(),
    ],
  })

  async function transform(content: string, prepend?: string) {
    const transformed = (await transformApply({ content, uno, prepend }))?.code
    return prettier(transformed || '', {
      parser: 'css',
      plugins: [parserCSS],
    }).trim()
  }

  it('handles @apply', async () => {
    const style = `
      .custom-class {
        @apply hidden md:block;
      }
    `
    expect(await transform(style)).toMatchInlineSnapshot(`
      ".custom-class {
        display: none;
      }
      @media (min-width: 768px) {
        .custom-class {
          display: block;
        }
      }"
    `)
  })

  it('handles --at-apply', async () => {
    const style = `
      .custom-class {
        --at-apply: hidden;
      }
    `
    expect(await transform(style)).toMatchInlineSnapshot(`
      ".custom-class {
        display: none;
      }"
    `)
  })

  it('wraps global around everything that is not the starting class name', async () => {
    const code = `
      button, .btn {
        --at-apply: flex mb-1 dark:rtl:hover:mr-1 hover:space-x-1 first-line:uppercase;
      }`
    expect(await transform(code)).toMatchInlineSnapshot(`
      "button,
      .btn {
        margin-bottom: 0.25rem;
        display: flex;
      }
      :global(.dark [dir=\\"rtl\\"]) button:hover,
      :global(.dark [dir=\\"rtl\\"]) .btn:hover {
        margin-right: 0.25rem;
      }
      button:hover :global(> :not([hidden]) ~ :not([hidden])),
      .btn:hover :global(> :not([hidden]) ~ :not([hidden])) {
        --un-space-x-reverse: 0;
        margin-left: calc(0.25rem * calc(1 - var(--un-space-x-reverse)));
        margin-right: calc(0.25rem * var(--un-space-x-reverse));
      }
      button::first-line,
      .btn::first-line {
        text-transform: uppercase;
      }"
    `)
  })

  it('can wrap utility names in quotes if code editor needs it', async () => {
    const notWrapped = `
      button {
        --at-apply: flex rtl:mr-1;
      }`
    const wrapped = `
      button {
        --at-apply: "flex rtl:mr-1";
      }`
    expect(await transform(notWrapped)).toEqual(await transform(wrapped))
  })

  it('handles complex parent and child dependent rule', async () => {
    const code = `
      button {
        --at-apply: flex rtl:mr-1 dark:sm:rtl:hover:space-x-1;
      }
      @media (min-width: 100px) {
        button {
          --at-apply: mb-1;
        }
      }
    `.trim()
    expect(await transform(code)).toMatchInlineSnapshot(`
      "button {
        display: flex;
      }
      :global([dir=\\"rtl\\"]) button {
        margin-right: 0.25rem;
      }
      @media (min-width: 640px) {
        :global(.dark [dir=\\"rtl\\"])
          button:hover
          :global(> :not([hidden]) ~ :not([hidden])) {
          --un-space-x-reverse: 0;
          margin-left: calc(0.25rem * calc(1 - var(--un-space-x-reverse)));
          margin-right: calc(0.25rem * var(--un-space-x-reverse));
        }
      }
      @media (min-width: 100px) {
        button {
          margin-bottom: 0.25rem;
        }
      }"
    `)
  })

  it('prepends', async () => {
    const style = `
      .custom-class {
        --at-apply: hidden;
      }
    `
    const prepend = `
    ::backdrop {
      --un-rotate: 0;
    }`
    expect(await transform(style, prepend)).toMatchInlineSnapshot(`
      "::backdrop {
        --un-rotate: 0;
      }
      .custom-class {
        display: none;
      }"
    `)
  })

  // TODO: file issue: using two media queries like `sm:lt-lg:ml-1` produces $$ instead of the necessary "and" between media queries and so is broken - I think it is a bug elsewhere in UnoCSS. It may be connected to regexScopePlaceholder
})
