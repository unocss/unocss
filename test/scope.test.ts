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

const generator = createGenerator()

test('scope', async() => {
  const { css } = await generator(fixture, '', '.foo-scope')
  expect(css).toMatchSnapshot()
})
