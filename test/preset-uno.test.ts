import { createGenerator, escapeSelector } from 'unocss'
import wind from '@unocss/preset-wind'

const classes: string[] = [
  // 'm1',
  // 'mx2',
  // 'pos-abs',
  // 'bg-red4',
  // 'font100',
  // 'font200',
]

const code = classes.join(' ')
const uno = createGenerator({
  presets: [
    wind(),
  ],
})

test('default', async() => {
  const { css } = await uno.generate(code)
  const { css: css2 } = await uno.generate(code)

  const unmatched = []
  for (const i of classes) {
    if (!css.includes(escapeSelector(i)))
      unmatched.push(i)
  }
  expect(unmatched).toEqual([])
  expect(css).toMatchSnapshot()
  expect(css).toEqual(css2)
})
