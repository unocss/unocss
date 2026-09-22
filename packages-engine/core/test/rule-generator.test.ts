import { createGenerator } from '@unocss/core'
import { expect, it } from 'vitest'
import { variantMatcher } from '@unocss/rule-utils'

it('rule-generator', async () => {
  const uno = await createGenerator({
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
  const uno = await createGenerator({
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
  const uno = await createGenerator({
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

it('rule-generator constructCSS with $$ variant parent', async () => {
  const uno = await createGenerator({
    rules: [
      [
        /^rule$/,
        function (_, { constructCSS }) {
          return constructCSS({
            animation: '__un_qm 0.5s',
          })
        },
      ],
    ],
    variants: [
      variantMatcher('dark', input => ({ prefix: `${input.prefix}.dark $$ ` })),
    ],
  })
  const { css } = await uno.generate('dark:rule')
  expect(css).toMatchInlineSnapshot(`
    "/* layer: default */
    .dark .dark\\:rule{animation:__un_qm 0.5s;}"
  `)
  // The raw $$ placeholder must never leak into output
  expect(css).not.toContain('$$')
})
