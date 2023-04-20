import { describe, expect, test } from 'vitest'
import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import presetIcons from '@unocss/preset-icons'
import { format as prettier } from 'prettier'
// @ts-expect-error missing types
import prettierSvelte from 'prettier-plugin-svelte'

import presetAttributify from '@unocss/preset-attributify'
import { transformSvelteSFC } from '../packages/vite/src/modes/svelte-scoped'

describe('svelte-scoped', () => {
  const uno = createGenerator({
    presets: [
      presetUno(),
      presetAttributify(),
      presetIcons({
        prefix: 'i-',
        extraProperties: {
          'display': 'inline-block',
          'vertical-align': 'middle',
        },
      }),
    ],
    shortcuts: [
      { shortcut: 'w-5' },
      { logo: 'i-logos:svelte-icon w-6em' },
    ],
  })

  async function transform(code: string, { combine = true, format = true } = {}) {
    const transformed = (await transformSvelteSFC(code, 'Foo.svelte', uno, { combine }))?.code
    if (transformed && format) {
      return prettier(transformed, {
        parser: 'svelte',
        plugins: [prettierSvelte],
      })
    }
    return transformed
  }

  test('simple', async () => {
    const code = '<div class="bg-red-500" />'
    expect(await transform(code)).toMatchInlineSnapshot(`
      "<div class=\\"uno-qecmtp\\" />

      <style>
        :global(.uno-qecmtp) {
          --un-bg-opacity: 1;
          background-color: rgba(239, 68, 68, var(--un-bg-opacity));
        }
      </style>
      "
    `)
    expect(await transform(code, { combine: false })).toMatchInlineSnapshot(`
      "<div class=\\"_uno-qecmtp__bg-red-500\\" />

      <style>
        :global(._uno-qecmtp__bg-red-500) {
          --un-bg-opacity: 1;
          background-color: rgba(239, 68, 68, var(--un-bg-opacity));
        }
      </style>
      "
    `)
  })

  test('wraps parent and child dependent classes like rtl: and space-x-1 with :global() wrapper', async () => {
    const code = '<div class="mb-1 text-sm rtl:right-0 space-x-1" />'
    expect(await transform(code)).toMatchInlineSnapshot(`
      "<div class=\\"uno-5o8qvr\\" />

      <style>
        :global([dir=\\"rtl\\"] .uno-5o8qvr) {
          right: 0;
        }
        :global(.uno-5o8qvr) {
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
        }
        :global(.uno-5o8qvr > :not([hidden]) ~ :not([hidden])) {
          --un-space-x-reverse: 0;
          margin-left: calc(0.25rem * calc(1 - var(--un-space-x-reverse)));
          margin-right: calc(0.25rem * var(--un-space-x-reverse));
        }
      </style>
      "
    `)
    expect(await transform(code, { combine: false })).toMatchInlineSnapshot(`
      "<div
        class=\\"_uno-5o8qvr__mb-1 _uno-5o8qvr__rtl:right-0 _uno-5o8qvr__space-x-1 _uno-5o8qvr__text-sm\\"
      />

      <style>
        :global([dir=\\"rtl\\"] ._uno-5o8qvr__rtl\\\\:right-0) {
          right: 0;
        }
        :global(._uno-5o8qvr__mb-1) {
          margin-bottom: 0.25rem;
        }
        :global(._uno-5o8qvr__space-x-1 > :not([hidden]) ~ :not([hidden])) {
          --un-space-x-reverse: 0;
          margin-left: calc(0.25rem * calc(1 - var(--un-space-x-reverse)));
          margin-right: calc(0.25rem * var(--un-space-x-reverse));
        }
        :global(._uno-5o8qvr__text-sm) {
          font-size: 0.875rem;
          line-height: 1.25rem;
        }
      </style>
      "
    `)
  })

  test('handles class directives, including shorthand syntax; uses same hash for multiple occurrences of same class(es)', async () => {
    const result = await transform(`
    <div class="flex"/>
    <div class:flex={bar} />
    <div class:flex />
    <div class:flex/>
    <div class:flex>
    <div class:flex class="bar" />
    `.trim(), { format: false })
    expect(result).toMatchInlineSnapshot(`
      "<div class=\\"uno-ntbwax\\"/>
          <div class:uno-ntbwax=\\"{bar}\\" />
          <div class:uno-ntbwax=\\"{flex}\\" />
          <div class:uno-ntbwax=\\"{flex}\\"/>
          <div class:uno-ntbwax=\\"{flex}\\">
          <div class:uno-ntbwax=\\"{flex}\\" class=\\"bar\\" />
      <style>:global(.uno-ntbwax){display:flex;}</style>"
    `)
  })

  test('handles class directives, including shorthand syntax; do not handle if class name is not known', async () => {
    const result = await transform(`
    <div class:flex={bar} />
    <div class:flex />
    <div class:foo={bar} />
    <div class:bar />
    <div class:foo class="bar" />
    <div class:bar class="bar" />
    `.trim())
    expect(result).toMatchInlineSnapshot(`
      "<div class:uno-ntbwax={bar} />
      <div class:uno-ntbwax={flex} />
      <div class:foo={bar} />
      <div class:bar />
      <div class:foo class=\\"bar\\" />
      <div class:bar class=\\"bar\\" />

      <style>
        :global(.uno-ntbwax) {
          display: flex;
        }
      </style>
      "
    `)
  })

  test('order of utility classes does not affect output', async () => {
    const order1CSS = await transform('<div class="flex bg-blue-400 my-awesome-class font-bold"></div>')
    const order2CSS = await transform('<div class="my-awesome-class bg-blue-400  font-bold flex"></div>')
    expect(order1CSS).toBe(order2CSS)
  })

  test(':global() properly handles @media queries', async () => {
    const result = await transform(`
    <div class="dark:hover:sm:space-x-1" />`.trim())
    expect(result).toMatchInlineSnapshot(`
      "<div class=\\"uno-ghi1pr\\" />

      <style>
        @media (min-width: 640px) {
          :global(.dark .uno-ghi1pr:hover > :not([hidden]) ~ :not([hidden])) {
            --un-space-x-reverse: 0;
            margin-left: calc(0.25rem * calc(1 - var(--un-space-x-reverse)));
            margin-right: calc(0.25rem * var(--un-space-x-reverse));
          }
        }
      </style>
      "
    `)
  })

  test('does not place :global() around animate-bounce keyframe digits', async () => {
    const result = await transform('<div class="animate-bounce" />')
    expect(result).toMatchInlineSnapshot(`
      "<div class=\\"uno-08wkbk\\" />

      <style>
        :global(.uno-08wkbk) {
          animation: bounce 1s linear infinite;
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
      </style>
      "
    `)
  })

  test('shortcut with icon', async () => {
    const result = await transform(`
    <span class="logo" />`.trim())
    expect(result).toMatchSnapshot()
  })

  test('handles backticks and single quotes', async () => {
    const backticks = await transform(`<script></script>
    <span class=\`font-bold\` />
    <style></style>`, { format: false })
    expect(backticks).toMatchInlineSnapshot(`
      "<script></script>
          <span class=\\"uno-7eon1d\\" />
          <style>:global(.uno-7eon1d){font-weight:700;}</style>"
    `)
    const singleQuotes = await transform(`
    <span class='font-bold' />`.trim())
    expect(singleQuotes).toMatchInlineSnapshot(`
      "<span class=\\"uno-7eon1d\\" />

      <style>
        :global(.uno-7eon1d) {
          font-weight: 700;
        }
      </style>
      "
    `)
  })

  test('handles classes in inline conditionals', async () => {
    // people should probably write this as `class:text-red-600={err} class:text-green-600={!err} etc...` but people commonly use inline conditionals complex situations as demoed in this test and we should support them if we want this to be an easy migration from other Tailwind based tools.
    const result = await transform(`
    <span class="font-bold {bar ? 'text-red-600' : 'text-(green-500 blue-400) font-semibold boo'} underline foo {baz ? 'italic ' : ''}">Hello</span>`.trim())
    expect(result).toMatchInlineSnapshot(`
      "<span
        class=\\"uno-ub1kk5 foo {bar ? 'uno-3mbu3c' : 'uno-1wg5ef boo'} {baz
          ? 'uno-mfrd4i'
          : ''}\\">Hello</span
      >

      <style>
        :global(.uno-1wg5ef) {
          font-weight: 600;
          --un-text-opacity: 1;
          color: rgba(96, 165, 250, var(--un-text-opacity));
          color: rgba(34, 197, 94, var(--un-text-opacity));
        }
        :global(.uno-ub1kk5) {
          font-weight: 700;
          text-decoration-line: underline;
        }
        :global(.uno-mfrd4i) {
          font-style: italic;
        }
        :global(.uno-3mbu3c) {
          --un-text-opacity: 1;
          color: rgba(220, 38, 38, var(--un-text-opacity));
        }
      </style>
      "
    `)
  })

  test('handles classes in inline expressions', async () => {
    const code = `
      <span
        class={classnames(
          'text-red-500 px-4 py-2',
          foo ? "font-bold shortcut" : 'font-medium',
          'foo',
          bar && 'hover:(bg-blue-500 text-white) baz',
        )}
      >
        Hello
      </span>

      <input
        class={classnames(
          'border border-gray-300 rounded px-4 py-2 transition focus:foo hover:border-gray-400 data-[error]:siblings:aria-[invalid]:visible',
          'left-icon' in $$slots && 'pl-10'
        )}
        {...$$restProps}
      />
    `.trim()
    expect(await transform(code)).toMatchInlineSnapshot(`
      "<span
        class={classnames(
          \\"uno-fjmpfw\\",
          foo ? \\"uno-a6q3c1\\" : \\"uno-ochcf1\\",
          \\"foo\\",
          bar && \\"uno-shagg1 baz\\"
        )}
      >
        Hello
      </span>

      <input
        class={classnames(
          \\"uno-aoxmfn focus:foo\\",
          \\"left-icon\\" in $$slots && \\"uno-rm5qbw\\"
        )}
        {...$$restProps}
      />

      <style>
        :global(.uno-aoxmfn[aria-invalid] ~ *[data-error]) {
          visibility: visible;
        }
        :global(.uno-a6q3c1) {
          width: 1.25rem;
          font-weight: 700;
        }
        :global(.uno-aoxmfn) {
          border-width: 1px;
          --un-border-opacity: 1;
          border-color: rgba(209, 213, 219, var(--un-border-opacity));
          border-radius: 0.25rem;
          padding-left: 1rem;
          padding-right: 1rem;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          transition-property: color, background-color, border-color, outline-color,
            text-decoration-color, fill, stroke, opacity, box-shadow, transform,
            filter, backdrop-filter;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
        :global(.uno-aoxmfn:hover) {
          --un-border-opacity: 1;
          border-color: rgba(156, 163, 175, var(--un-border-opacity));
        }
        :global(.uno-shagg1:hover) {
          --un-bg-opacity: 1;
          background-color: rgba(59, 130, 246, var(--un-bg-opacity));
          --un-text-opacity: 1;
          color: rgba(255, 255, 255, var(--un-text-opacity));
        }
        :global(.uno-fjmpfw) {
          padding-left: 1rem;
          padding-right: 1rem;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          --un-text-opacity: 1;
          color: rgba(239, 68, 68, var(--un-text-opacity));
        }
        :global(.uno-rm5qbw) {
          padding-left: 2.5rem;
        }
        :global(.uno-ochcf1) {
          font-weight: 500;
        }
      </style>
      "
    `)
    expect(await transform(code, { combine: false })).toMatchInlineSnapshot(`
      "<span
        class={classnames(
          \\"_uno-fjmpfw__px-4 _uno-fjmpfw__py-2 _uno-fjmpfw__text-red-500\\",
          foo
            ? \\"_uno-a6q3c1__font-bold _uno-a6q3c1__shortcut\\"
            : \\"_uno-ochcf1__font-medium\\",
          \\"foo\\",
          bar && \\"_uno-shagg1__hover:bg-blue-500 _uno-shagg1__hover:text-white baz\\"
        )}
      >
        Hello
      </span>

      <input
        class={classnames(
          \\"_uno-aoxmfn__border _uno-aoxmfn__border-gray-300 _uno-aoxmfn__data-[error]:siblings:aria-[invalid]:visible _uno-aoxmfn__hover:border-gray-400 _uno-aoxmfn__px-4 _uno-aoxmfn__py-2 _uno-aoxmfn__rounded _uno-aoxmfn__transition focus:foo\\",
          \\"left-icon\\" in $$slots && \\"_uno-rm5qbw__pl-10\\"
        )}
        {...$$restProps}
      />

      <style>
        :global(
            ._uno-aoxmfn__data-\\\\[error\\\\]\\\\:siblings\\\\:aria-\\\\[invalid\\\\]\\\\:visible[aria-invalid]
              ~ *[data-error]
          ) {
          visibility: visible;
        }
        :global(._uno-a6q3c1__shortcut) {
          width: 1.25rem;
        }
        :global(._uno-aoxmfn__border) {
          border-width: 1px;
        }
        :global(._uno-aoxmfn__border-gray-300) {
          --un-border-opacity: 1;
          border-color: rgba(209, 213, 219, var(--un-border-opacity));
        }
        :global(._uno-aoxmfn__hover\\\\:border-gray-400:hover) {
          --un-border-opacity: 1;
          border-color: rgba(156, 163, 175, var(--un-border-opacity));
        }
        :global(._uno-aoxmfn__rounded) {
          border-radius: 0.25rem;
        }
        :global(._uno-shagg1__hover\\\\:bg-blue-500:hover) {
          --un-bg-opacity: 1;
          background-color: rgba(59, 130, 246, var(--un-bg-opacity));
        }
        :global(._uno-aoxmfn__px-4, ._uno-fjmpfw__px-4) {
          padding-left: 1rem;
          padding-right: 1rem;
        }
        :global(._uno-aoxmfn__py-2, ._uno-fjmpfw__py-2) {
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }
        :global(._uno-rm5qbw__pl-10) {
          padding-left: 2.5rem;
        }
        :global(._uno-a6q3c1__font-bold) {
          font-weight: 700;
        }
        :global(._uno-ochcf1__font-medium) {
          font-weight: 500;
        }
        :global(._uno-fjmpfw__text-red-500) {
          --un-text-opacity: 1;
          color: rgba(239, 68, 68, var(--un-text-opacity));
        }
        :global(._uno-shagg1__hover\\\\:text-white:hover) {
          --un-text-opacity: 1;
          color: rgba(255, 255, 255, var(--un-text-opacity));
        }
        :global(._uno-aoxmfn__transition) {
          transition-property: color, background-color, border-color, outline-color,
            text-decoration-color, fill, stroke, opacity, box-shadow, transform,
            filter, backdrop-filter;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
      </style>
      "
    `)
  })

  test('handles classes in quoted inline expressions', async () => {
    const result = await transform(`
    <span class="{classnames('text-red-500', foo ? 'font-bold' : 'font-medium', 'foo', bar && 'hover:(bg-blue-500 text-white) baz')}">Hello</span>`.trim())
    expect(result).toMatchInlineSnapshot(`
      "<span
        class={classnames(
          \\"uno-jz8hdl\\",
          foo ? \\"uno-7eon1d\\" : \\"uno-ochcf1\\",
          \\"foo\\",
          bar && \\"uno-shagg1 baz\\"
        )}>Hello</span
      >

      <style>
        :global(.uno-shagg1:hover) {
          --un-bg-opacity: 1;
          background-color: rgba(59, 130, 246, var(--un-bg-opacity));
          --un-text-opacity: 1;
          color: rgba(255, 255, 255, var(--un-text-opacity));
        }
        :global(.uno-7eon1d) {
          font-weight: 700;
        }
        :global(.uno-ochcf1) {
          font-weight: 500;
        }
        :global(.uno-jz8hdl) {
          --un-text-opacity: 1;
          color: rgba(239, 68, 68, var(--un-text-opacity));
        }
      </style>
      "
    `)
  })

  test('no tokens found returns undefined', async () => {
    const result = await transform(`
    <div class="foo" />
    <style global>
      .foo {
        color: red;
      }
    </style>`.trim())
    expect(result).toMatchInlineSnapshot('undefined')
  })

  test('preserve existing style tag', async () => {
    const result = await transform(`
    <div class="px-2" />
    <style lang="scss">
      .foo {
        color: red;
      }
    </style>`.trim())
    expect(result).toMatchInlineSnapshot(`
      "<div class=\\"uno-u9076x\\" />

      <style lang=\\"scss\\">
        .foo {
          color: red;
        }
        :global(.uno-u9076x) {
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }
      </style>
      "
    `)
  })

  test('dev, only hash but not combine mode, handles classes that fail when coming at the beginning of a shortcut name', async () => {
    const code = '<div class="mb-1 !mt-2 md:mr-3 space-x-1" />'
    expect(await transform(code)).toMatchInlineSnapshot(`
      "<div class=\\"uno-apjhc7\\" />

      <style>
        :global(.uno-apjhc7) {
          margin-top: 0.5rem !important;
          margin-bottom: 0.25rem;
        }
        :global(.uno-apjhc7 > :not([hidden]) ~ :not([hidden])) {
          --un-space-x-reverse: 0;
          margin-left: calc(0.25rem * calc(1 - var(--un-space-x-reverse)));
          margin-right: calc(0.25rem * var(--un-space-x-reverse));
        }
        @media (min-width: 768px) {
          :global(.uno-apjhc7) {
            margin-right: 0.75rem;
          }
        }
      </style>
      "
    `)
    expect(await transform(code, { combine: false })).toMatchInlineSnapshot(`
      "<div
        class=\\"_uno-apjhc7__!mt-2 _uno-apjhc7__mb-1 _uno-apjhc7__md:mr-3 _uno-apjhc7__space-x-1\\"
      />

      <style>
        :global(._uno-apjhc7__\\\\!mt-2) {
          margin-top: 0.5rem !important;
        }
        :global(._uno-apjhc7__mb-1) {
          margin-bottom: 0.25rem;
        }
        :global(._uno-apjhc7__space-x-1 > :not([hidden]) ~ :not([hidden])) {
          --un-space-x-reverse: 0;
          margin-left: calc(0.25rem * calc(1 - var(--un-space-x-reverse)));
          margin-right: calc(0.25rem * var(--un-space-x-reverse));
        }
        @media (min-width: 768px) {
          :global(._uno-apjhc7__md\\\\:mr-3) {
            margin-right: 0.75rem;
          }
        }
      </style>
      "
    `)
  })

  test('everything', async () => {
    const code = `
<div class="bg-red-500 sm:text-xl dark:hover:bg-green-500 transform scale-5" />
<div class:logo class="foo bar" />
<div class:text-orange-400={foo} class="shortcut" />

<div class="text-center sm:text-left rtl:sm:text-right space-x-1 rtl:space-x-reverse foo">
  <div class="text-sm hover:text-red" />
  <Button class="hover:text-red text-sm" />
</div>
    `.trim()
    expect(await transform(code)).toMatchSnapshot()
    expect(await transform(code, { combine: false })).toMatchSnapshot()
  })
})
