import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import presetIcons from '@unocss/preset-icons'

test('prefix', async() => {
  const positive = [
    'uno-pl-10px',
    'hover:uno-p-4',
    '!uno-p-5px',
    'uno-btn',
    'uno-btn1',
  ]

  const negative = [
    'pl-10px',
    'hover:p-4',
    '!p-5px',
    'btn',
    'btn1',
  ]

  const uno = createGenerator({
    prefix: 'uno-',
    presets: [
      presetUno(),
      presetIcons(),
    ],
    shortcuts: {
      btn: 'mr-10',
      btn1: 'ml-10 btn',
    },
  })
  const { css, matched } = await uno.generate(new Set([...positive, ...negative]))
  expect(matched).toEqual(new Set(positive))
  expect(css).toMatchSnapshot()
})

test('prefix icons', async() => {
  const positive = [
    'uno:i-carbon-sun',
    'dark:uno:i-carbon-moon',
    'uno:bg-red-200',
  ]

  const negative = [
    'i-carbon-moon',
  ]

  const uno = createGenerator({
    prefix: 'uno:',
    presets: [
      presetUno(),
      presetIcons(),
    ],
  })

  const { css, matched } = await uno.generate(new Set([...positive, ...negative]))
  expect(matched).toEqual(new Set(positive))
  expect(css).toMatchSnapshot()
})
