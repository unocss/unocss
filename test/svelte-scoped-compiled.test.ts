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

  test('general', async () => {
    const result = await transform(`
<div class="bg-red-500 text-xl font-bold border border-gray-200 dark:hover:bg-green-500 transform scale-5">
<div class="foo bar">
<div class="shortcut">

<div class="text-center sm:text-left foo">
  <div class="text-sm font-bold hover:text-red"/>
  <div class="text-sm font-bold hover:text-red"/>
</div>
    `.trim())
    expect(result).toMatchInlineSnapshot(`
      "<div class=\\"uno-pe1esh\\">
      <div class=\\"foo bar\\">
      <div class=\\"uno-7unwxf\\">

      <div class=\\"uno-cbgd7b foo\\">
        <div class=\\"uno-s9yxer\\"/>
        <div class=\\"uno-s9yxer\\"/>
      </div>
      <style>:global(.uno-7unwxf){width:1.25rem;}:global(.uno-pe1esh){--un-scale-x:0.05;--un-scale-y:0.05;transform:translateX(var(--un-translate-x)) translateY(var(--un-translate-y)) translateZ(var(--un-translate-z)) rotate(var(--un-rotate)) rotateX(var(--un-rotate-x)) rotateY(var(--un-rotate-y)) rotateZ(var(--un-rotate-z)) skewX(var(--un-skew-x)) skewY(var(--un-skew-y)) scaleX(var(--un-scale-x)) scaleY(var(--un-scale-y)) scaleZ(var(--un-scale-z));border-width:1px;border-style:solid;--un-border-opacity:1;border-color:rgba(229,231,235,var(--un-border-opacity));--un-bg-opacity:1;background-color:rgba(239,68,68,var(--un-bg-opacity));font-size:1.25rem;line-height:1.75rem;font-weight:700;}:global(.dark .uno-pe1esh:hover){--un-bg-opacity:1;background-color:rgba(34,197,94,var(--un-bg-opacity));}:global(.uno-cbgd7b){text-align:center;}:global(.uno-s9yxer){font-size:0.875rem;line-height:1.25rem;font-weight:700;}:global(.uno-s9yxer:hover){--un-text-opacity:1;color:rgba(248,113,113,var(--un-text-opacity));}@media (min-width: 640px){:global(.uno-cbgd7b){text-align:left;}}</style>"
    `)
  })

  test('different sequence of utility classes', async () => {
    const order1CSS = await transform('<div class="flex bg-blue-400 my-awesome-class font-bold"></div>')
    const order2CSS = await transform('<div class="my-awesome-class bg-blue-400  font-bold flex"></div>')
    expect(order1CSS).toBe(order2CSS)
  })

  test('handles class directives, including shorthand syntax', async () => {
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

  test('wraps rtl: and space-x-1 with :global() wrapper', async () => {
    const result = await transform(`
    <div class="mb-1 text-sm rtl:right-0 space-x-1" />`.trim())
    expect(result).toMatchInlineSnapshot(`
      "<div class=\\"uno-05wrs8\\" />
      <style>:global([dir=\\"rtl\\"] .uno-05wrs8){right:0rem;}:global(.uno-05wrs8){margin-bottom:0.25rem;font-size:0.875rem;line-height:1.25rem;}:global(.uno-05wrs8>:not([hidden])~:not([hidden])){--un-space-x-reverse:0;margin-left:calc(0.25rem * calc(1 - var(--un-space-x-reverse)));margin-right:calc(0.25rem * var(--un-space-x-reverse));}</style>"
    `)
  })

  test(':global() does not mess with @media queries', async () => {
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

  test('@apply, --at-apply work', async () => {
    const result = await transform(`
    <slot />
    <style global>
      .foo {
        --at-apply: sm:mb-1 hover:mb-2;
      }
    </style>`.trim())
    expect(result).toMatchInlineSnapshot('null')
  })

  test('shortcut with icon', async () => {
    const result = await transform(`
    <span class="logo" />`.trim())
    expect(result).toMatchInlineSnapshot(`
      "<span class=\\"uno-t7gn8a\\" />
      <style>:global(.uno-t7gn8a){background:url(\\"data:image/svg+xml;utf8,%3Csvg viewBox='0 0 256 308' display='inline-block' vertical-align='middle' width='1em' height='1em' xmlns='http://www.w3.org/2000/svg' %3E%3Cpath fill='%23FF3E00' d='M239.682 40.707C211.113-.182 154.69-12.301 113.895 13.69L42.247 59.356a82.198 82.198 0 0 0-37.135 55.056a86.566 86.566 0 0 0 8.536 55.576a82.425 82.425 0 0 0-12.296 30.719a87.596 87.596 0 0 0 14.964 66.244c28.574 40.893 84.997 53.007 125.787 27.016l71.648-45.664a82.182 82.182 0 0 0 37.135-55.057a86.601 86.601 0 0 0-8.53-55.577a82.409 82.409 0 0 0 12.29-30.718a87.573 87.573 0 0 0-14.963-66.244'/%3E%3Cpath fill='%23FFF' d='M106.889 270.841c-23.102 6.007-47.497-3.036-61.103-22.648a52.685 52.685 0 0 1-9.003-39.85a49.978 49.978 0 0 1 1.713-6.693l1.35-4.115l3.671 2.697a92.447 92.447 0 0 0 28.036 14.007l2.663.808l-.245 2.659a16.067 16.067 0 0 0 2.89 10.656a17.143 17.143 0 0 0 18.397 6.828a15.786 15.786 0 0 0 4.403-1.935l71.67-45.672a14.922 14.922 0 0 0 6.734-9.977a15.923 15.923 0 0 0-2.713-12.011a17.156 17.156 0 0 0-18.404-6.832a15.78 15.78 0 0 0-4.396 1.933l-27.35 17.434a52.298 52.298 0 0 1-14.553 6.391c-23.101 6.007-47.497-3.036-61.101-22.649a52.681 52.681 0 0 1-9.004-39.849a49.428 49.428 0 0 1 22.34-33.114l71.664-45.677a52.218 52.218 0 0 1 14.563-6.398c23.101-6.007 47.497 3.036 61.101 22.648a52.685 52.685 0 0 1 9.004 39.85a50.559 50.559 0 0 1-1.713 6.692l-1.35 4.116l-3.67-2.693a92.373 92.373 0 0 0-28.037-14.013l-2.664-.809l.246-2.658a16.099 16.099 0 0 0-2.89-10.656a17.143 17.143 0 0 0-18.398-6.828a15.786 15.786 0 0 0-4.402 1.935l-71.67 45.674a14.898 14.898 0 0 0-6.73 9.975a15.9 15.9 0 0 0 2.709 12.012a17.156 17.156 0 0 0 18.404 6.832a15.841 15.841 0 0 0 4.402-1.935l27.345-17.427a52.147 52.147 0 0 1 14.552-6.397c23.101-6.006 47.497 3.037 61.102 22.65a52.681 52.681 0 0 1 9.003 39.848a49.453 49.453 0 0 1-22.34 33.12l-71.664 45.673a52.218 52.218 0 0 1-14.563 6.398'/%3E%3C/svg%3E\\") no-repeat;background-size:100% 100%;background-color:transparent;display:inline-block;vertical-align:middle;width:1em;height:1em;width:6em;}</style>"
    `)
  })

  // Add more tests to cover all use cases in https://github.com/unocss/unocss/issues/1676:
})
