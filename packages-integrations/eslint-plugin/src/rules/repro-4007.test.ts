import { fileURLToPath } from 'node:url'
import { $ as html, run } from 'eslint-vitest-rule-tester'
import * as vueParser from 'vue-eslint-parser'
import rule from './order'

run({
  name: 'repro-4007',
  rule,
  languageOptions: { parser: vueParser },
  settings: { unocss: { configPath: fileURLToPath(new URL('./uno.config.ts', import.meta.url)) } },
  valid: [],
  invalid: [
    {
      description: 'class (doit être détecté)',
      code: html`
        <template>
          <div class="mx1 m1 mr-1"></div>
        </template>
      `,
      errors: [{ messageId: 'invalid-order' }],
    },
    {
      description: 'attribut attributify avec valeur (bug 4007)',
      code: html`
        <template>
          <div un-before="mx1 m1 mr-1"></div>
        </template>
      `,
      errors: [{ messageId: 'invalid-order' }],
    },
  ],
})
