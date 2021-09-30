import { createGenerator, defaultConfig } from '../src'

test('default', () => {
  const generator = createGenerator(defaultConfig)

  expect(generator([
    'p-1',
    'pt-2',
    'p-3',
    'pl-10px',
    'hover:p-4',
    '!p-5px',
    '!hover:p-10',
    'hover:!p-10',
  ].join(' '))).toMatchSnapshot()
})
