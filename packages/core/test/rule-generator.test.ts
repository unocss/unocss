import { createGenerator } from '@unocss/core'
import { expect, it } from 'vitest'

it('rule-generator', async () => {
  const uno = createGenerator({
    rules: [
      [/^rule$/, function* () {
        yield {
          color: 'red',
        }
        yield {
          'font-size': '12px',
        }
      }],
    ],
  })
  expect((await uno.generate('rule')).css)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      .rule{color:red;}
      .rule{font-size:12px;}"
    `)
})

it('rule-generator async', async () => {
  const uno = createGenerator({
    rules: [
      [/^rule$/, async function* () {
        yield {
          color: 'red',
        }
        await new Promise(resolve => setTimeout(resolve, 2))
        yield {
          'font-size': '12px',
        }
        yield {
          'font-weight': 'bold',
        }
      }],
    ],
  })
  expect((await uno.generate('rule')).css)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      .rule{color:red;}
      .rule{font-size:12px;}
      .rule{font-weight:bold;}"
    `)
})

it('rule-generator bail out', async () => {
  const uno = createGenerator({
    rules: [
      [/^rule-(.*)$/, function () {
        return {
          content: '"fallback"',
        }
      }],
      [/^rule-(.*)$/, function* ([_, str]) {
        if (str === 'bail') {
          return // early return should still work
        }
        yield {
          color: str,
        }
        yield {
          'font-size': '12px',
        }
      }],
    ],
  })
  expect((await uno.generate('rule-bail rule-red')).css)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      .rule-bail{content:"fallback";}
      .rule-red{color:red;}
      .rule-red{font-size:12px;}"
    `)
})
