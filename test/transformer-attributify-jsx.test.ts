import MagicString from 'magic-string'
import { createGenerator } from '@unocss/core'
import { describe, expect, test } from 'vitest'
import transformerAttributifyJsx from '../packages/transformer-attributify-jsx'

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
  `
  const code = new MagicString(originalCode)

  const uno = createGenerator({})

  test('transform', () => {
    transformerAttributifyJsx().transform(code, 'foo.js', { uno, tokens: new Set() } as any)

    expect(code.toString()).toMatchInlineSnapshot(`
      "
          <div h-full=\\"\\" text-center=\\"\\" flex=\\"\\" select-none=\\"\\">
        <div ma=\\"\\">
          <div text-5xl=\\"\\" fw100=\\"\\" animate-bounce-alt=\\"\\" animate-count-infinite=\\"\\" animate-duration-1s=\\"\\">
            unocss
          </div>
          <div op30=\\"\\" text-lg=\\"\\" fw300=\\"\\" m1=\\"\\">
            The instant on-demand Atomic CSS engine.
          </div>
          <div m2=\\"\\" flex=\\"\\" justify-center=\\"\\" text-2xl=\\"\\" op30=\\"\\" hover=\\"op80\\">
            <a
              i-carbon-logo-github=\\"\\"
              text-inherit=\\"\\"
              href=\\"https://github.com/unocss/unocss\\"
              target=\\"_blank\\"
            ></a>
          </div>
        </div>
      </div>
      <div absolute=\\"\\" bottom-5=\\"\\" right-0=\\"\\" left-0=\\"\\" text-center=\\"\\" op30=\\"\\" fw300=\\"\\">
        on-demand · instant · fully customizable
      </div>
        "
    `)
  })
})
