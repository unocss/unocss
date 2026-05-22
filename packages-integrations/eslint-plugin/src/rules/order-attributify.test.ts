import { fileURLToPath } from 'node:url'
import { $ as html, run } from 'eslint-vitest-rule-tester'
import { expect } from 'vitest'
import * as vueParser from 'vue-eslint-parser'
import rule from './order-attributify'

run({
  name: 'order-attributify',
  rule,
  languageOptions: {
    parser: vueParser,
  },
  settings: {
    unocss: {
      configPath: fileURLToPath(new URL('./uno.config.ts', import.meta.url)),
    },
  },

  valid: [
    // Already sorted
    html`
      <template>
        <div m1 mx1 mr-1></div>
      </template>
    `,
    // class attribute should be ignored
    html`
      <template>
        <div m1 mx1 class="mr-1 ml-1"></div>
      </template>
    `,
    // style attribute should be ignored
    html`
      <template>
        <div m1 mx1 style="color: red"></div>
      </template>
    `,
    // Boolean attributes (no false positive)
    html`
      <template>
        <div disabled m1 mx1></div>
      </template>
    `,
    // Multi-line attributes (no false positive, fixes #2780)
    html`
      <template>
        <div
          m1
          mx1
          mr-1
        ></div>
      </template>
    `,
  ],
  invalid: [
    {
      description: 'unsorted attributify attributes',
      code: html`
        <template>
          <div mx1 m1 mr-1></div>
        </template>
      `,
      output: output => expect(output).toMatchInlineSnapshot(`
         "<template>
           <div    m1 mx1 mr-1 ></div>
         </template>"
       `),
      errors: [
        {
          messageId: 'invalid-order',
        },
      ],
    },
    {
      description: 'unsorted multi-line attributify attributes (regression for #2780)',
      code: html`
        <template>
          <div
            mx1
            m1
            mr-1
          ></div>
        </template>
      `,
      output: output => expect(output).toMatchInlineSnapshot(`
         "<template>
           <div
             
             
              m1 mx1 mr-1 
           ></div>
         </template>"
       `),
      errors: [
        {
          messageId: 'invalid-order',
        },
      ],
    },
    {
      description: 'boolean attribute with unsorted utilities',
      code: html`
        <template>
          <div disabled mx1 m1 mr-1></div>
        </template>
      `,
      output: output => expect(output).toMatchInlineSnapshot(`
         "<template>
           <div     disabled m1 mx1 mr-1 ></div>
         </template>"
       `),
      errors: [
        {
          messageId: 'invalid-order',
        },
      ],
    },
  ],
})
