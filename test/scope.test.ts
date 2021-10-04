import { createGenerator } from 'unocss'

export const fixture = [
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
].join(' ')

const uno = createGenerator()

test('scope', async() => {
  const { css } = await uno.generate(fixture, '', '.foo-scope')
  expect(css).toMatchSnapshot()
})
