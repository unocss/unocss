import { fileURLToPath } from 'node:url'
import * as vueParser from 'vue-eslint-parser'
import { $ as html, run } from 'eslint-vitest-rule-tester'
import { expect } from 'vitest'
import rule from './order'

run({
  name: 'order',
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
    html`
      <template>
        <div class="m1 mx1 mr-1"></div>
      </template>
    `,
  ],
  invalid: [
    {
      code: html`
        <template>
          <div class="mx1 m1 mr-1"></div>
        </template>
      `,
      output: output => expect(output).toMatchInlineSnapshot(`
        "<template>
          <div class="m1 mx1 mr-1"></div>
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
