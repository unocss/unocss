import { createGenerator } from '@unocss/core'
import { describe, expect, it } from 'vitest'
import presetPxToViewport from '@unocss/preset-px-to-viewport'
import presetMini from '@unocss/preset-mini'

describe('px-to-viewport', () => {
  const uno = createGenerator({
    presets: [
      presetMini(),
      presetPxToViewport(),
    ],
  })

  it('should works', async () => {
    expect((await uno.generate(
      new Set([
        'top-3.75px',
        'basis-3.75px',
        'gap-3.75px',
        'm-3.75px',
        'mx-3.75px',
        '-p-3.75px',
        'w-3.75px',
        'm-w-3.75px',
        'max-w-3.75px',
        'h-3.75px',
        'm-h-3.75px',
        'max-h-3.75px',
        'size-3.75px',
        'text-3.75px',
        'leading-3.75px',
        'underline-offset-3.75px',
        'indent-3.75px',
        'rounded-3.75px',
        'border-3.75px',
        'divide-x-3.75px',
        'outline-3.75px',
        'outline-offset-3.75px',
        'ring-3.75px',
        'blur-3.75px',
        'backdrop-blur-3.75px',
        'translate-x-3.75px',
      ]),
      { preflights: false },
    )).css)
      .toMatchInlineSnapshot(`
        "/* layer: default */
        .-p-3\\.75px{padding:-1vmin;}
        .m-3\\.75px{margin:1vmin;}
        .mx-3\\.75px{margin-left:1vmin;margin-right:1vmin;}
        .border-3\\.75px{border-width:1vmin;}
        .rounded-3\\.75px{border-radius:1vmin;}
        .text-3\\.75px{font-size:1vmin;}
        .leading-3\\.75px{line-height:1vmin;}
        .indent-3\\.75px{text-indent:1vmin;}
        .underline-offset-3\\.75px{text-underline-offset:1vmin;}
        .ring-3\\.75px{--un-ring-width:1vmin;--un-ring-offset-shadow:var(--un-ring-inset) 0 0 0 var(--un-ring-offset-width) var(--un-ring-offset-color);--un-ring-shadow:var(--un-ring-inset) 0 0 0 calc(var(--un-ring-width) + var(--un-ring-offset-width)) var(--un-ring-color);box-shadow:var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow);}
        .basis-3\\.75px{flex-basis:1vmin;}
        .gap-3\\.75px{gap:1vmin;}
        .size-3\\.75px{width:1vmin;height:1vmin;}
        .h-3\\.75px{height:1vmin;}
        .max-h-3\\.75px{max-height:1vmin;}
        .max-w-3\\.75px{max-width:1vmin;}
        .w-3\\.75px{width:1vmin;}
        .outline-3\\.75px{outline-width:1vmin;}
        .outline-offset-3\\.75px{outline-offset:1vmin;}
        .top-3\\.75px{top:1vmin;}
        .translate-x-3\\.75px{--un-translate-x:1vmin;transform:translateX(var(--un-translate-x)) translateY(var(--un-translate-y)) translateZ(var(--un-translate-z)) rotate(var(--un-rotate)) rotateX(var(--un-rotate-x)) rotateY(var(--un-rotate-y)) rotateZ(var(--un-rotate-z)) skewX(var(--un-skew-x)) skewY(var(--un-skew-y)) scaleX(var(--un-scale-x)) scaleY(var(--un-scale-y)) scaleZ(var(--un-scale-z));}"
      `)
  })

  it('important prefix should works', async () => {
    expect((await uno.generate(
      new Set([
        '!top-3.75px',
        '!basis-3.75px',
        '!gap-3.75px',
        '!m-3.75px',
        '!mx-3.75px',
        '!-p-3.75px',
        '!w-3.75px',
        '!m-w-3.75px',
        '!max-w-3.75px',
        '!h-3.75px',
        '!m-h-3.75px',
        '!max-h-3.75px',
        '!size-3.75px',
        '!text-3.75px',
        '!leading-3.75px',
        '!underline-offset-3.75px',
        '!indent-3.75px',
        '!rounded-3.75px',
        '!border-3.75px',
        '!divide-x-3.75px',
        '!outline-3.75px',
        '!outline-offset-3.75px',
        '!ring-3.75px',
        '!blur-3.75px',
        '!backdrop-blur-3.75px',
        '!translate-x-3.75px',
      ]),
      { preflights: false },
    )).css)
      .toMatchInlineSnapshot(`
        "/* layer: default */
        .\\!-p-3\\.75px{padding:-1vmin !important;}
        .\\!m-3\\.75px{margin:1vmin !important;}
        .\\!mx-3\\.75px{margin-left:1vmin !important;margin-right:1vmin !important;}
        .\\!border-3\\.75px{border-width:1vmin !important;}
        .\\!rounded-3\\.75px{border-radius:1vmin !important;}
        .\\!text-3\\.75px{font-size:1vmin !important;}
        .\\!leading-3\\.75px{line-height:1vmin !important;}
        .\\!indent-3\\.75px{text-indent:1vmin !important;}
        .\\!underline-offset-3\\.75px{text-underline-offset:1vmin !important;}
        .\\!ring-3\\.75px{--un-ring-width:1vmin !important;--un-ring-offset-shadow:var(--un-ring-inset) 0 0 0 var(--un-ring-offset-width) var(--un-ring-offset-color) !important;--un-ring-shadow:var(--un-ring-inset) 0 0 0 calc(var(--un-ring-width) + var(--un-ring-offset-width)) var(--un-ring-color) !important;box-shadow:var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow) !important;}
        .\\!basis-3\\.75px{flex-basis:1vmin !important;}
        .\\!gap-3\\.75px{gap:1vmin !important;}
        .\\!size-3\\.75px{width:1vmin !important;height:1vmin !important;}
        .\\!h-3\\.75px{height:1vmin !important;}
        .\\!max-h-3\\.75px{max-height:1vmin !important;}
        .\\!max-w-3\\.75px{max-width:1vmin !important;}
        .\\!w-3\\.75px{width:1vmin !important;}
        .\\!outline-3\\.75px{outline-width:1vmin !important;}
        .\\!outline-offset-3\\.75px{outline-offset:1vmin !important;}
        .\\!top-3\\.75px{top:1vmin !important;}
        .\\!translate-x-3\\.75px{--un-translate-x:1vmin !important;transform:translateX(var(--un-translate-x)) translateY(var(--un-translate-y)) translateZ(var(--un-translate-z)) rotate(var(--un-rotate)) rotateX(var(--un-rotate-x)) rotateY(var(--un-rotate-y)) rotateZ(var(--un-rotate-z)) skewX(var(--un-skew-x)) skewY(var(--un-skew-y)) scaleX(var(--un-scale-x)) scaleY(var(--un-scale-y)) scaleZ(var(--un-scale-z)) !important;}"
      `)
  })
})
