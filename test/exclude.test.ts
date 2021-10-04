import { createGenerator } from 'hummin'

describe('exclude', () => {
  test('basic', async() => {
    const generate1 = createGenerator()
    const generate2 = createGenerator({
      warnExcluded: false,
      excluded: [
        'block',
        /^text-/,
      ],
    })
    const { css: css1 } = await generate1('block text-red-200')
    const { css: css2 } = await generate2('block text-red-200')
    expect(css1).toContain('.block')
    expect(css1).toContain('.text-red-200')
    expect(css2).toBe('')
  })
})
