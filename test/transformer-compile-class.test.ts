import { describe, expect, test } from 'vitest'
import type { UnoGenerator } from '@unocss/core'
import { createGenerator } from '@unocss/core'
import MagicString from 'magic-string'
import transformerCompileClass from '@unocss/transformer-compile-class'
import presetUno from '@unocss/preset-uno'

describe('transformer-compile-class', () => {
  const uno = createGenerator({
    presets: [
      presetUno(),
    ],
  })
  const transformer = transformerCompileClass()

  async function transform(code: string, _uno: UnoGenerator = uno) {
    const s = new MagicString(code)
    await transformer.transform(s, 'foo.js', { uno: _uno } as any)
    const result = s.toString()
    const { css } = await uno.generate(result)
    return {
      code: result,
      css,
    }
  }

  test('basic', async () => {
    const result = await transform(`
    <div class=":uno: bg-red-500 text-xl font-bold border border-gray-200 dark:hover:bg-green-500 transform scale-5">
    <div class=":uno: foo bar">

    <div class=":uno: text-center sm:text-left foo">
      <div class=":uno: text-sm font-bold hover:text-red"/>
    </div>
    `)
    expect(result).toMatchInlineSnapshot(`
      {
        "code": "
          <div class=\\"uno-qe05lz\\">
          <div class=\\"foo bar\\">

          <div class=\\"uno-qlmcrp foo\\">
            <div class=\\"uno-0qw2gr\\"/>
          </div>
          ",
        "css": "/* layer: preflights */
      *,::before,::after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-transform:translateX(var(--un-translate-x)) translateY(var(--un-translate-y)) translateZ(var(--un-translate-z)) rotate(var(--un-rotate)) rotateX(var(--un-rotate-x)) rotateY(var(--un-rotate-y)) rotateZ(var(--un-rotate-z)) skewX(var(--un-skew-x)) skewY(var(--un-skew-y)) scaleX(var(--un-scale-x)) scaleY(var(--un-scale-y)) scaleZ(var(--un-scale-z));--un-pan-x:var(--un-empty,/*!*/ /*!*/);--un-pan-y:var(--un-empty,/*!*/ /*!*/);--un-pinch-zoom:var(--un-empty,/*!*/ /*!*/);--un-touch-action:var(--un-pan-x) var(--un-pan-y) var(--un-pinch-zoom);--un-scroll-snap-strictness:proximity;--un-ordinal:var(--un-empty,/*!*/ /*!*/);--un-slashed-zero:var(--un-empty,/*!*/ /*!*/);--un-numeric-figure:var(--un-empty,/*!*/ /*!*/);--un-numeric-spacing:var(--un-empty,/*!*/ /*!*/);--un-numeric-fraction:var(--un-empty,/*!*/ /*!*/);--un-font-variant-numeric:var(--un-ordinal) var(--un-slashed-zero) var(--un-numeric-figure) var(--un-numeric-spacing) var(--un-numeric-fraction);--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 #0000;--un-ring-shadow:0 0 #0000;--un-shadow-inset:var(--un-empty,/*!*/ /*!*/);--un-shadow:0 0 #0000;--un-ring-inset:var(--un-empty,/*!*/ /*!*/);--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgba(147,197,253,0.5);--un-blur:var(--un-empty,/*!*/ /*!*/);--un-brightness:var(--un-empty,/*!*/ /*!*/);--un-contrast:var(--un-empty,/*!*/ /*!*/);--un-drop-shadow:var(--un-empty,/*!*/ /*!*/);--un-grayscale:var(--un-empty,/*!*/ /*!*/);--un-hue-rotate:var(--un-empty,/*!*/ /*!*/);--un-invert:var(--un-empty,/*!*/ /*!*/);--un-saturate:var(--un-empty,/*!*/ /*!*/);--un-sepia:var(--un-empty,/*!*/ /*!*/);--un-filter:var(--un-blur) var(--un-brightness) var(--un-contrast) var(--un-drop-shadow) var(--un-grayscale) var(--un-hue-rotate) var(--un-invert) var(--un-saturate) var(--un-sepia);--un-backdrop-blur:var(--un-empty,/*!*/ /*!*/);--un-backdrop-brightness:var(--un-empty,/*!*/ /*!*/);--un-backdrop-contrast:var(--un-empty,/*!*/ /*!*/);--un-backdrop-grayscale:var(--un-empty,/*!*/ /*!*/);--un-backdrop-hue-rotate:var(--un-empty,/*!*/ /*!*/);--un-backdrop-invert:var(--un-empty,/*!*/ /*!*/);--un-backdrop-opacity:var(--un-empty,/*!*/ /*!*/);--un-backdrop-saturate:var(--un-empty,/*!*/ /*!*/);--un-backdrop-sepia:var(--un-empty,/*!*/ /*!*/);--un-backdrop-filter:var(--un-backdrop-blur) var(--un-backdrop-brightness) var(--un-backdrop-contrast) var(--un-backdrop-grayscale) var(--un-backdrop-hue-rotate) var(--un-backdrop-invert) var(--un-backdrop-opacity) var(--un-backdrop-saturate) var(--un-backdrop-sepia);}
      /* layer: shortcuts */
      .uno-qe05lz{--un-scale-x:0.05;--un-scale-y:0.05;transform:var(--un-transform);border-width:1px;border-style:solid;--un-border-opacity:1;border-color:rgba(229,231,235,var(--un-border-opacity));--un-bg-opacity:1;background-color:rgba(239,68,68,var(--un-bg-opacity));font-size:1.25rem;line-height:1.75rem;font-weight:700;}
      .dark .uno-qe05lz:hover{--un-bg-opacity:1;background-color:rgba(34,197,94,var(--un-bg-opacity));}
      .uno-qlmcrp{text-align:center;}
      .uno-0qw2gr{font-size:0.875rem;line-height:1.25rem;font-weight:700;}
      .uno-0qw2gr:hover{--un-text-opacity:1;color:rgba(248,113,113,var(--un-text-opacity));}
      @media (min-width: 640px){
      .uno-qlmcrp{text-align:left;}
      }",
      }
    `)
  })
})
