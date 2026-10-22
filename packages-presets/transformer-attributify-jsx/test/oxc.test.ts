import { createGenerator } from '@unocss/core'
import MagicString from 'magic-string'
import { describe, expect, it, vi } from 'vitest'
import transformerAttributifyJsx from '../src'
import { attributifyJsxOxcResolver } from '../src/resolver/oxc'

describe('resolver-oxc', async () => {
  const uno = await createGenerator()

  it('selects resolvers from include patterns', async () => {
    const transformer = transformerAttributifyJsx({
      include: [
        { pattern: /\.mdx$/, resolver: 'regex' },
        { pattern: /\.tsx$/, resolver: 'oxc' },
      ],
    })
    const errorCode = '<d iv></div>'

    expect(transformer.idFilter?.('app.mdx')).toBe(true)
    expect(transformer.idFilter?.('app.tsx')).toBe(true)
    expect(transformer.idFilter?.('app.vue')).toBe(false)
    await expect(transformer.transform(new MagicString(errorCode), 'app.mdx', { uno } as any)).resolves.toBeUndefined()
    await expect(transformer.transform(new MagicString(errorCode), 'app.tsx', { uno } as any)).rejects.toThrow('Oxc parse errors')
  })

  it('retains fallback for include patterns without a resolver', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const transformer = transformerAttributifyJsx({ include: /\.tsx$/ })

    await expect(transformer.transform(new MagicString('<d iv></div>'), 'app.tsx', { uno } as any)).resolves.toBeUndefined()
    expect(warn).toHaveBeenCalledOnce()

    warn.mockRestore()
  })

  it('uses the first matching include pattern and respects exclude', async () => {
    const transformer = transformerAttributifyJsx({
      include: [
        { pattern: /\.tsx$/, resolver: 'regex' },
        { pattern: /^app\./, resolver: 'oxc' },
      ],
      exclude: /excluded/,
    })

    expect(transformer.idFilter?.('app.tsx')).toBe(true)
    expect(transformer.idFilter?.('excluded.tsx')).toBe(false)
    await expect(transformer.transform(new MagicString('<d iv></div>'), 'app.tsx', { uno } as any)).resolves.toBeUndefined()
  })

  it('error', async () => {
    const errorCode = '<d iv></div>'
    const code = new MagicString(errorCode)
    const transform = attributifyJsxOxcResolver({ code, id: 'app.tsx', uno: { uno, tokens: new Set() } as any, isBlocked: () => false })
    await expect(transform).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Oxc parse errors:

        x Expected corresponding JSX closing tag for 'd'.
         ,-[app.tsx:1:9]
       1 | <d iv></div>
         :  |      ^|^
         :  |       \`-- Expected \`</d>\`
         :  \`-- Opened here
         \`----
      ]
    `)
  })
})
