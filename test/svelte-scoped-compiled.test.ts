import { describe, expect, test } from 'vitest'
import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import presetIcons from '@unocss/preset-icons'

import { transformSFC } from '../packages/vite/src/modes/svelte-scoped-compiled'

describe('svelte-scoped-compiled', () => {
  const uno = createGenerator({
    presets: [
      presetUno(),
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

  async function transform(code: string) {
    return await transformSFC(code, 'Foo.svelte', uno)
  }

  test('simple', async () => {
    const result = await transform(`
    <div class="bg-red-500" />
    `.trim())
    expect(result).toMatchInlineSnapshot(`
      "<div class=\\"uno-rs78p2\\" />
      <style>:global(.uno-rs78p2){--un-bg-opacity:1;background-color:rgba(239,68,68,var(--un-bg-opacity));}</style>"
    `)
  })

  test('wraps parent and child dependent classes like rtl: and space-x-1 with :global() wrapper', async () => {
    const result = await transform(`
    <div class="mb-1 text-sm rtl:right-0 space-x-1" />`.trim())
    expect(result).toMatchInlineSnapshot(`
      "<div class=\\"uno-05wrs8\\" />
      <style>:global([dir=\\"rtl\\"] .uno-05wrs8){right:0rem;}:global(.uno-05wrs8){margin-bottom:0.25rem;font-size:0.875rem;line-height:1.25rem;}:global(.uno-05wrs8>:not([hidden])~:not([hidden])){--un-space-x-reverse:0;margin-left:calc(0.25rem * calc(1 - var(--un-space-x-reverse)));margin-right:calc(0.25rem * var(--un-space-x-reverse));}</style>"
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
    `.trim())
    expect(result).toMatchInlineSnapshot(`
      "<div class=\\"uno-kagvzm\\"/>
          <div class:uno-kagvzm={bar} />
          <div class:uno-kagvzm={flex} />
          <div class:uno-kagvzm={flex}/>
          <div class:uno-kagvzm={flex}>
          <div class:uno-kagvzm={flex} class=\\"bar\\" />
      <style>:global(.uno-kagvzm){display:flex;}</style>"
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
      "<div class=\\"uno-xutpqi\\" />
      <style>@media (min-width: 640px){:global(.dark .uno-xutpqi>:not([hidden])~:not([hidden]):hover){--un-space-x-reverse:0;margin-left:calc(0.25rem * calc(1 - var(--un-space-x-reverse)));margin-right:calc(0.25rem * var(--un-space-x-reverse));}}</style>"
    `)
  })

  test('does not place :global() around animate-bounce keyframe digits', async () => {
    const result = await transform(`
    <div class="animate-bounce" />`.trim())
    expect(result).toMatchInlineSnapshot(`
      "<div class=\\"uno-6e6tnj\\" />
      <style>:global(.uno-6e6tnj){animation:bounce 1s linear infinite;}@keyframes bounce{0%, 100% {transform:translateY(-25%);animation-timing-function:cubic-bezier(0.8,0,1,1)} 50% {transform:translateY(0);animation-timing-function:cubic-bezier(0,0,0.2,1)}}</style>"
    `)
  })

  test('shortcut with icon', async () => {
    const result = await transform(`
    <span class="logo" />`.trim())
    expect(result).toMatchSnapshot()
  })

  test('handles backticks and single quotes', async () => {
    const backticks = await transform('<span class=`font-bold` />')
    expect(backticks).toMatchInlineSnapshot(`
      "<span class=\`uno-3ruxow\` />
      <style>:global(.uno-3ruxow){font-weight:700;}</style>"
    `)
    const singleQuotes = await transform(`
    <span class='font-bold' />`.trim())
    expect(singleQuotes).toMatchInlineSnapshot(`
      "<span class='uno-3ruxow' />
      <style>:global(.uno-3ruxow){font-weight:700;}</style>"
    `)
  })

  test('handles classes in inline conditionals', async () => {
    // people should probably write this as `class:text-red-600={err} class:text-green-600={!err} etc...` but people commonly use inline conditionals complex situations as demoed in this test and we should support them if we want this to be an easy migration from other Tailwind based tools.
    const result = await transform(`
    <span class="font-bold {bar ? 'text-red-600' : 'text-(green-500 blue-400) font-semibold boo'} underline foo {baz ? 'italic ' : ''}">Hello</span>`.trim())
    expect(result).toMatchInlineSnapshot(`
      "<span class=\\"uno-q0wubg {bar ? 'uno-nlyu1f' : 'uno-d8wudg boo'} foo {baz ? 'uno-qw1oq5' : ''}\\">Hello</span>
      <style>:global(.uno-d8wudg){font-weight:600;--un-text-opacity:1;color:rgba(96,165,250,var(--un-text-opacity));color:rgba(34,197,94,var(--un-text-opacity));}:global(.uno-q0wubg){font-weight:700;text-decoration-line:underline;}:global(.uno-qw1oq5){font-style:italic;}:global(.uno-nlyu1f){--un-text-opacity:1;color:rgba(220,38,38,var(--un-text-opacity));}</style>"
    `)
  })

  test('no tokens found lets code pass through', async () => {
    const result = await transform(`
    <div class="foo" />
    <style global>
      .foo {
        color: red;
      }
    </style>`.trim())
    expect(result).toMatchInlineSnapshot(`
      "<div class=\\"foo\\" />
          <style global>
            .foo {
              color: red;
            }
          </style>"
    `)
  })

  test('everything', async () => {
    const result = await transform(`
<div class="bg-red-500 sm:text-xl dark:hover:bg-green-500 transform scale-5" />
<div class:logo class="foo bar" />
<div class:text-orange-400={foo} class="shortcut" />

<div class="text-center sm:text-left rtl:sm:text-right space-x-1 rtl:space-x-reverse foo">
  <div class="text-sm hover:text-red" />
  <Button class="hover:text-red text-sm" />
</div>
    `.trim())
    expect(result).toMatchSnapshot()
  })
})
