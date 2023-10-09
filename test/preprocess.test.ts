import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import presetIcons from '@unocss/preset-icons'
import { describe, expect, it } from 'vitest'

describe('preprocess', () => {
  it('prefix', async () => {
    const positive = [
      'uno:pl-10px',
      'uno:hover:p-4',
      'uno:sm:p-6',
      'uno:!p-5px',
      'uno:btn',
      'uno:btn1',
      'uno:dark:i-carbon-moon',
    ]

    const negative = [
      'pl-10px',
      'hover:p-4',
      '!p-5px',
      'btn',
      'btn1',
      'i-carbon-moon',
    ]

    const uno = createGenerator({
      preprocess: m => m.startsWith('uno:') ? m.substr(4) : '',
      presets: [
        presetUno(),
        presetIcons(),
      ],
      shortcuts: {
        btn: 'mr-10',
        btn1: 'ml-10 btn',
      },
    })
    const { css, matched } = await uno.generate(new Set([...positive, ...negative]), { preflights: false })
    expect(matched).eql(new Set(positive))
    expect(css).toMatchSnapshot()
  })

  it('tailwind prefix', async () => {
    const positive = [
      'uno:pl-10px',
      'hover:uno:p-4',
      'sm:uno:p-6',
      '!uno:p-5px',
      'uno-btn',
      'uno:btn1',
    ]

    const negative = [
      'pl-10px',
      'hover:p-4',
      '!p-5px',
      'btn',
      'btn1',
    ]

    const prefixRE = /uno[:-]/
    const uno = createGenerator({
      preprocess: m => prefixRE.test(m) ? m.replace(prefixRE, '') : '',
      presets: [
        presetUno(),
        presetIcons(),
      ],
      shortcuts: {
        btn: 'mr-10',
        btn1: 'ml-10 btn',
      },
    })
    const { css, matched } = await uno.generate(new Set([...positive, ...negative]), { preflights: false })
    expect(matched).eql(new Set(positive))
    expect(css).toMatchSnapshot()
  })
})
