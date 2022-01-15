import { createGenerator, CSSObject } from '@unocss/core'
import { colorResolver } from '@unocss/preset-mini/utils'
import presetUno from '@unocss/preset-uno'
import { expect, test } from 'vitest'

const uno = createGenerator({
  presets: [
    presetUno(),
    {
      name: 'scrollbar',
      shortcuts: [
        ['scrollbar-thin-all', 'scrollbar:w-2 scrollbar:h-2 scrollbar-thin'],
        [/^scrollbar-bg-(track|thumb)-(.+)$/, ([, t, s]) => `scrollbar-${t}:bg-${s} scrollbar-${t}-${s}`],
      ],
      variants: [
        (input) => {
          const m = input.match(/^(scrollbar(?:-(?:thumb|track|track-piece|button|corner))?):/)
          if (m) {
            return {
              matcher: input.slice(m[0].length),
              selector: s => `${s}::-webkit-${m[1]}`
            }
          }
        },
      ],
      rules: [
        [/^scrollbar-(thin|none|auto)$/, ([, w]) => ({ 'scrollbar-width': w })],
        [/^scrollbar-(track|thumb)-(.+)$/, ([, section, c], context) => {
            const varName = `scroll${section}-bg`
            const color = colorResolver(`--un-${varName}`, varName)(['', c], context) as CSSObject | undefined
            if (color) {
              return {
                ...color,
                'scrollbar-color': 'var(--un-scrollthumb-bg) var(--un-scrolltrack-bg)'
              }
            }
          }
        ]
      ]
    },
  ],
})

test('scrollbar', async() => {
  const { css } = await uno.generate(fixture, { scope: '.foo-scope' })
  expect(css).toMatchSnapshot()
})
