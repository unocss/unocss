import { createGenerator, e } from '@unocss/core'
import { describe, expect, it } from 'vitest'

describe('rule-raw', () => {
  it('basic', async () => {
    const uno = createGenerator({
      presets: [],
      rules: [
        ['before', { content: 'before' }],
        [/^m-(.+)$/, ([, d], { rawSelector }) => {
          if (d.includes('hi')) {
            return `
/* return a string to take full control of the generated CSS */
/* this also means you have to take care of all the things yourself */
/* for example, escaping, applying variants, etc. */
.${e(rawSelector)} {
  border-bottom: 1px solid green;
}
.${e(rawSelector)}::after {
  content: ${JSON.stringify(d)};
  color: skyblue;
}
.hi ${e(rawSelector)}::before {
  content: 'hi';
}
`.trim()
          }
        }],
        // the other two rules are making sure the sorting is correct
        [/^m-(\d+)$/, ([, d]) => ({ margin: `${d}px` })],
      ],
    })
    const { css } = await uno.generate('m-1 m-hi-anthony m-hi-hi before', { preflights: false })
    expect(css).toMatchSnapshot('')
  })
})
