import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import presetIcons from '@unocss/preset-icons'

test('prefix', async() => {
  const fixture = new Set([
    'uno-pl-10px',
    'hover:uno-p-4',
    '!uno-p-5px',
    'uno-btn',
    'uno-btn1',
    'pl-10px',
    'hover:p-4',
    '!p-5px',
    'btn',
    'btn1',
  ])

  const uno = createGenerator({
    prefix: 'uno-',
    presets: [
      presetUno(),
    ],
    shortcuts: {
      btn: 'mr-10',
      btn1: 'ml-10 btn',
    },
  })
  const { css } = await uno.generate(fixture)
  expect(css).toMatchSnapshot()
})

test('prefix icons', async() => {
  const fixture = new Set([
    'uno:i-carbon-sun',
    'dark:uno:i-carbon-moon',
    'uno:bg-red-200',
    'i-carbon-moon',
  ])

  const uno = createGenerator({
    prefix: 'uno:',
    presets: [
      presetUno(),
      presetIcons(),
    ],
  })

  const { css } = await uno.generate(fixture)
  expect(css).toMatchSnapshot()
})
