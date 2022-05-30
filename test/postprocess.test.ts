import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { expect, test } from 'vitest'

test('postprocess', async () => {
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
  expect(css).toMatchSnapshot()
})
