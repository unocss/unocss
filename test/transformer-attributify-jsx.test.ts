import MagicString from 'magic-string'
import presetAttributify from '@unocss/preset-attributify'
import presetUno from '@unocss/preset-uno'
import { createGenerator } from '@unocss/core'
import { describe, expect, test } from 'vitest'
import transformerAttributifyJsx from '../packages/transformer-attributify-jsx/src'

describe('transformerAttributifyJs', () => {
  const originalCode = `
<div h-full text-center flex select-none>
  <div ma>
    <div text-5xl fw100 animate-bounce-alt animate-count-infinite animate-duration-1s>
      unocss
    </div>
    <div op30 text-lg fw300 m1>
      The instant on-demand Atomic CSS engine.
    </div>
    <div m2 flex justify-center text-2xl op30 hover="op80">
      <a
        i-carbon-logo-github
        text-inherit
        href="https://github.com/unocss/unocss"
        target="_blank"
      ></a>
    </div>
  </div>
</div>
<div absolute bottom-5 right-0 left-0 text-center op30 fw300>
  on-demand · instant · fully customizable
</div>
  `.trim()

  const uno = createGenerator({
    presets: [
      presetUno(),
      presetAttributify(),
    ],
  })

  test('transform', async () => {
    const code = new MagicString(originalCode)
    await transformerAttributifyJsx().transform(code, 'app.tsx', { uno, tokens: new Set() } as any)

    expect(code.toString()).toMatchInlineSnapshot(`
      "<div h-full=\\"\\" text-center=\\"\\" flex=\\"\\" select-none=\\"\\">
        <div ma=\\"\\">
          <div text-5xl=\\"\\" fw100=\\"\\" animate-bounce-alt=\\"\\" animate-count-infinite=\\"\\" animate-duration-1s=\\"\\">
            unocss
          </div>
          <div op30=\\"\\" text-lg=\\"\\" fw300=\\"\\" m1=\\"\\">
            The instant on-demand Atomic CSS engine.
          </div>
          <div m2=\\"\\" flex=\\"\\" justify-center=\\"\\" text-2xl=\\"\\" op30=\\"\\" hover=\\"op80\\">
            <a
              i-carbon-logo-github
              text-inherit=\\"\\"
              href=\\"https://github.com/unocss/unocss\\"
              target=\\"_blank\\"
            ></a>
          </div>
        </div>
      </div>
      <div absolute=\\"\\" bottom-5=\\"\\" right-0=\\"\\" left-0=\\"\\" text-center=\\"\\" op30=\\"\\" fw300=\\"\\">
        on-demand · instant · fully customizable
      </div>"
    `)
  })

  test('blocklist', async () => {
    const code = new MagicString(originalCode)
    const blocklist = ['flex', 'absolute', /op[0-9]+/]

    await transformerAttributifyJsx({
      blocklist,
    }).transform(code, 'app.jsx', { uno, tokens: new Set() } as any)

    expect(code.toString()).toMatchInlineSnapshot(`
      "<div h-full=\\"\\" text-center=\\"\\" flex select-none=\\"\\">
        <div ma=\\"\\">
          <div text-5xl=\\"\\" fw100=\\"\\" animate-bounce-alt=\\"\\" animate-count-infinite=\\"\\" animate-duration-1s=\\"\\">
            unocss
          </div>
          <div op30 text-lg=\\"\\" fw300=\\"\\" m1=\\"\\">
            The instant on-demand Atomic CSS engine.
          </div>
          <div m2=\\"\\" flex justify-center=\\"\\" text-2xl=\\"\\" op30 hover=\\"op80\\">
            <a
              i-carbon-logo-github
              text-inherit=\\"\\"
              href=\\"https://github.com/unocss/unocss\\"
              target=\\"_blank\\"
            ></a>
          </div>
        </div>
      </div>
      <div absolute bottom-5=\\"\\" right-0=\\"\\" left-0=\\"\\" text-center=\\"\\" op30 fw300=\\"\\">
        on-demand · instant · fully customizable
      </div>"
    `)

    const codeToString = code.toString()
    blocklist.forEach((rule) => {
      if (rule instanceof RegExp)
        expect(new RegExp(`${rule.source}=""`).test(codeToString)).not.true
      else
        expect(codeToString).not.toMatch(`${rule}=""`)
    })
  })
})
