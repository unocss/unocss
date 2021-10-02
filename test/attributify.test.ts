import { createGenerator, presetDefault } from '../src'
import { variantAttributify, extractorAttributify, presetAttributify } from '../src/presets/attributify'

describe('attributify', () => {
  const code = `
<button 
  bg="blue-400 hover:blue-500 dark:blue-500 dark:hover:blue-600"
  text="sm white"
  flex="~ col"
  border="rounded-xl"
  font="mono light"
  p="y-2 x-4"
  border="2 rounded blue-200"
>
  Button
</button>
`

  const extract = extractorAttributify(code, '')

  test('extractor', async() => {
    expect(await extract).toMatchSnapshot()
  })

  test('variant', async() => {
    expect(Array.from(await extract).map(i => variantAttributify.match(i, {} as any))).toMatchSnapshot()
  })

  test('generate', async() => {
    const generate = createGenerator({
      presets: [
        presetAttributify,
        presetDefault,
      ],
    })
    expect(await generate(code)).toMatchSnapshot()
  })
})
