import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { expect, it } from 'vitest'

it('postprocess', async () => {
  const positive = [
    'text-opacity-50',
    'scale-100',
  ]

  const uno = createGenerator({
    presets: [
      presetUno(),
      {
        name: 'inline-preset',
        postprocess: (obj) => {
          obj.entries.forEach((i) => {
            i[0] = String(i[0]).replace(/^--un-/g, '--hi-')
            if (i[1])
              i[1] = String(i[1]).replace(/--un-/g, '--hi-')
          })
        },
      },
    ],
    postprocess: [
      (obj) => {
        if (obj.selector.startsWith('.text-'))
          return
        obj.entries.forEach((i) => {
          i[0] = String(i[0]).replace(/^--hi-/g, '--hello-')
          if (i[1])
            i[1] = String(i[1]).replace(/--hi-/g, '--hello-')
        })
      },
    ],
  })
  const { css, matched } = await uno.generate(new Set([...positive]), { preflights: false })
  expect(matched).eql(new Set(positive))
  expect(css).toMatchInlineSnapshot(`
    "/* layer: default */
    .scale-100{--hello-scale-x:1;--hello-scale-y:1;transform:translateX(var(--hello-translate-x)) translateY(var(--hello-translate-y)) translateZ(var(--hello-translate-z)) rotate(var(--hello-rotate)) rotateX(var(--hello-rotate-x)) rotateY(var(--hello-rotate-y)) rotateZ(var(--hello-rotate-z)) skewX(var(--hello-skew-x)) skewY(var(--hello-skew-y)) scaleX(var(--hello-scale-x)) scaleY(var(--hello-scale-y)) scaleZ(var(--hello-scale-z));}
    .text-opacity-50{--hi-text-opacity:0.5;}"
  `)
})
