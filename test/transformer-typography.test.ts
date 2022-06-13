import { describe, expect, test } from 'vitest'
import type { UnoGenerator } from '@unocss/core'
import { createGenerator } from '@unocss/core'
import MagicString from 'magic-string'
import transformerTypography from '@unocss/transformer-typography'
import presetUno from '@unocss/preset-uno'

describe('transformer-typography', () => {
  const uno = createGenerator({
    presets: [
      presetUno(),
    ],
  })
  const transformer = transformerTypography({
    utilities: {
      'prose': {
        'p': ['font-sans', 'text-gray-800'],
        'blockquote ul li code': ['text-sm', 'bg-light-400', 'px-2', 'py-1', 'rounded', 'lg:text-base'],
      },
      'prose-dark': {
        p: ['font-sans', 'text-white'],
      },
    },
  })

  async function transform(code: string, _uno: UnoGenerator = uno) {
    const s = new MagicString(code)
    await transformer.transform(s, 'foo.js', { uno: _uno } as any)
    const result = s.toString()
    const { css } = await uno.generate(result)
    return {
      code: result,
      css,
    }
  }

  test('basic', async () => {
    const result = await transform(`
    <div class="prose">
      <p>Foo</p>
    </div>
    `)
    expect(result).toMatchSnapshot()
  })
})
