import { describe, expect, test } from 'vitest'
import { createContext } from '@unocss/shared-integration'
import type { VitePluginConfig } from '@unocss/vite'
import presetUno from '@unocss/preset-uno'
import { transformSFC } from '../packages/vite/src/modes/svelte-scoped-compiled'

describe('svelte-scoped-compiled', () => {
  const ctx = createContext<VitePluginConfig>({
    // mode: 'svelte-scoped-compiled', not required
    presets: [
      presetUno(),
    ],
    shortcuts: [
      { shortcut: 'hover:rotate-180' },
      // { logo: 'i-logos:svelte-icon w-6em h-6em transform transition-800 hover:rotate-180' },
    ],
  })

  async function transform(code: string) {
    return await transformSFC(code, 'foo.js', ctx)
  }

  test('basic', async () => {
    const result = await transform(`
<div class="bg-red-500 text-xl font-bold border border-gray-200 dark:hover:bg-green-500 transform scale-5">
<div class="foo bar">
<div class="shortcut">

<div class="text-center sm:text-left foo">
  <div class="text-sm font-bold hover:text-red"/>
</div>
    `.trim())
    expect(result).toMatchInlineSnapshot(`
      "<div class=\\"uno-pe1esh\\">
      <div class=\\"uno-ztntfp foo bar\\">
      <div class=\\"uno-7unwxf\\">

      <div class=\\"uno-cbgd7b foo\\">
        <div class=\\"uno-s9yxer\\"/>
      </div>
      <style>/* layer: default */
      .scale-5{--un-scale-x:0.05;--un-scale-y:0.05;transform:translateX(var(--un-translate-x)) translateY(var(--un-translate-y)) translateZ(var(--un-translate-z)) rotate(var(--un-rotate)) rotateX(var(--un-rotate-x)) rotateY(var(--un-rotate-y)) rotateZ(var(--un-rotate-z)) skewX(var(--un-skew-x)) skewY(var(--un-skew-y)) scaleX(var(--un-scale-x)) scaleY(var(--un-scale-y)) scaleZ(var(--un-scale-z));}
      .transform{transform:translateX(var(--un-translate-x)) translateY(var(--un-translate-y)) translateZ(var(--un-translate-z)) rotate(var(--un-rotate)) rotateX(var(--un-rotate-x)) rotateY(var(--un-rotate-y)) rotateZ(var(--un-rotate-z)) skewX(var(--un-skew-x)) skewY(var(--un-skew-y)) scaleX(var(--un-scale-x)) scaleY(var(--un-scale-y)) scaleZ(var(--un-scale-z));}
      .border{border-width:1px;border-style:solid;}
      .border-gray-200{--un-border-opacity:1;border-color:rgba(229,231,235,var(--un-border-opacity));}
      .bg-red-500{--un-bg-opacity:1;background-color:rgba(239,68,68,var(--un-bg-opacity));}
      .dark .dark\\\\:hover\\\\:bg-green-500:hover{--un-bg-opacity:1;background-color:rgba(34,197,94,var(--un-bg-opacity));}
      .text-xl{font-size:1.25rem;line-height:1.75rem;}
      .font-bold{font-weight:700;}/* layer: shortcuts */
      .shortcut:hover{--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-rotate:180deg;transform:translateX(var(--un-translate-x)) translateY(var(--un-translate-y)) translateZ(var(--un-translate-z)) rotate(var(--un-rotate)) rotateX(var(--un-rotate-x)) rotateY(var(--un-rotate-y)) rotateZ(var(--un-rotate-z)) skewX(var(--un-skew-x)) skewY(var(--un-skew-y)) scaleX(var(--un-scale-x)) scaleY(var(--un-scale-y)) scaleZ(var(--un-scale-z));}/* layer: default */
      .text-center{text-align:center;}
      @media (min-width: 640px){
      .sm\\\\:text-left{text-align:left;}
      }/* layer: default */
      .text-sm{font-size:0.875rem;line-height:1.25rem;}
      .font-bold{font-weight:700;}
      .hover\\\\:text-red:hover{--un-text-opacity:1;color:rgba(248,113,113,var(--un-text-opacity));}</style>"
    `)
  })

  // don't add bogus classname when it's all unknown classes
  // get shortcuts working

  // test('different sequence of utility classes', async () => {
  //   const order1 = await transform('<div class=":uno: flex bg-blue-400 my-awesome-class font-bold"></div>')
  //   const order2 = await transform('<div class=":uno: my-awesome-class bg-blue-400  font-bold flex"></div>')

  //   expect(order1.css).toBe(order2.css)
  //   expect(order1.code).toBe(order2.code)
  // })
})
