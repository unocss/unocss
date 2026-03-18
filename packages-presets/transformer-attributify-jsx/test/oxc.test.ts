import { createGenerator } from '@unocss/core'
import MagicString from 'magic-string'
import { describe, expect, it } from 'vitest'
import { attributifyJsxOxcResolver } from '../src/resolver/oxc'

describe('resolver-oxc', async () => {
  const uno = await createGenerator()

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
