import { createGenerator, presetUno } from 'unocss'

export const fixture = new Set([
  'pl-10px',
  'hover:p-4',
  '!p-5px',
  '!hover:px-10',
  'hover:!p-10',
  'flex',
  'dark:text-xl',
  'dark:hover:text-xl',
  'sm:text-red-100',
  'sm:text-red-200/10',
  'md:!hidden',
])

const uno = createGenerator({
  presets: [
    presetUno(),
  ],
})

test('scope', async() => {
  const { css } = await uno.generate(fixture, { scope: '.foo-scope' })
  expect(css).toMatchSnapshot()
})
