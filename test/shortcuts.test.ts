import { createGenerator } from '../packages/preset-default/src'

describe('shortcuts', () => {
  const generate = createGenerator({
    shortcuts: [
      ['sh1', 'px-2 py-3'],
      ['sh2', 'hover:text-lg text-sm text-lg'],
      ['sh3', 'sm:m-2 m-3'],
    ],
  })

  test('generate', async() => {
    const { css } = await generate('sh1 sh2 focus:sh2 sh3')
    expect(css).toMatchSnapshot()
  })
})
