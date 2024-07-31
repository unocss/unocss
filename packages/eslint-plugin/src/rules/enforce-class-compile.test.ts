import { fileURLToPath } from 'node:url'
import * as vueParser from 'vue-eslint-parser'
import { $ as html, run } from 'eslint-vitest-rule-tester'
import rule from './enforce-class-compile'

run({
  name: 'enforce-class-compile',
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
        <div class=":uno: mr-1"></div>
      </template>
    `,
    html`
      <template>
        <div :class="':uno: mr-1'"></div>
      </template>
    `,
    html`
      <template>
        <div :class="condition ? ':uno: mr-1' : ':uno: ml-1'"></div>
      </template>
    `,
    html`
      <template>
        <div :class="{':uno: mr-1': condition}"></div>
      </template>
    `,
    html`
      <template>
        <div :class="\`:uno: mr-1\`"></div>
      </template>
    `,

    {
      code: html`
        <template>
          <div class=":some: mr-1"></div>
        </template>
      `,
      options: [{ prefix: ':some:' }],
    },
    {
      code: html`
        <template>
          <div :class="':some: mr-1'"></div>
        </template>
      `,
      options: [{ prefix: ':some:' }],
    },
    {
      code: html`
        <template>
          <div :class="condition ? ':some: mr-1' : ':some: ml-1'"></div>
        </template>
      `,
      options: [{ prefix: ':some:' }],
    },
    {
      code: html`
        <template>
          <div :class="{':some: mr-1': condition}"></div>
        </template>
      `,
      options: [{ prefix: ':some:' }],
    },
    {
      code: html`
        <template>
          <div :class="\`:some: mr-1\`"></div>
        </template>
      `,
      options: [{ prefix: ':some:' }],
    },
  ],
  invalid: [
    {
      code: html`
        <template>
          <div class="mr-1"></div>
        </template>
      `,
      output: html`
        <template>
          <div class=":uno: mr-1"></div>
        </template>
      `,
      errors: [
        {
          messageId: 'missing',
          data: { prefix: ':uno:' },
          line: 2,
          column: 14,
          endLine: 2,
          endColumn: 20,
        },
      ],
    },
    {
      code: html`
        <template>
          <div :class="'mr-1'"></div>
        </template>
      `,
      errors: [
        {
          messageId: 'missing',
          data: { prefix: ':uno:' },
        },
      ],
      output: html`
        <template>
          <div :class="':uno: mr-1'"></div>
        </template>
      `,
    },
    {
      code: html`
        <template>
          <div :class="condition ? 'mr-1' : 'ml-1'"></div>
        </template>
      `,
      errors: [
        {
          messageId: 'missing',
          data: { prefix: ':uno:' },
        },
        {
          messageId: 'missing',
          data: { prefix: ':uno:' },
        },
      ],
      output: html`
        <template>
          <div :class="condition ? ':uno: mr-1' : ':uno: ml-1'"></div>
        </template>
      `,
    },
    {
      code: html`
        <template>
          <div :class="{'mr-1': condition}"></div>
        </template>
      `,
      errors: [
        {
          messageId: 'missing',
          data: { prefix: ':uno:' },
        },
      ],
      output: html`
        <template>
          <div :class="{':uno: mr-1': condition}"></div>
        </template>
      `,
    },
    {
      code: html`
        <template>
          <div :class="{flex}"></div>
        </template>
      `,
      errors: [
        {
          messageId: 'missing',
          data: { prefix: ':uno:' },
        },
      ],
      output: html`
        <template>
          <div :class="{':uno: flex': flex}"></div>
        </template>
      `,
    },
    {
      code: html`
        <template>
          <div :class="{flex: condition}"></div>
        </template>
      `,
      errors: [
        {
          messageId: 'missing',
          data: { prefix: ':uno:' },
        },
      ],
      output: html`
        <template>
          <div :class="{':uno: flex': condition}"></div>
        </template>
      `,
    },
    {
      code: html`
        <template>
          <div :class="\`mr-1\`"></div>
        </template>
      `,
      errors: [
        {
          messageId: 'missing',
          data: { prefix: ':uno:' },
        },
      ],
      output: html`
        <template>
          <div :class="\`:uno: mr-1\`"></div>
        </template>
      `,
    },

    {
      code: html`
        <template>
          <div :class="\`mr-1\`"></div>
        </template>
      `,
      options: [{ prefix: ':some:' }],
      errors: [
        {
          messageId: 'missing',
          data: { prefix: ':some:' },
        },
      ],
      output: html`
        <template>
          <div :class="\`:some: mr-1\`"></div>
        </template>
      `,
    },

    {
      code: html`
        <template>
          <div class="mr-1"></div>
        </template>
      `,
      options: [{ enableFix: false }],
      errors: [
        {
          messageId: 'missing',
          data: { prefix: ':uno:' },
        },
      ],
      output: null,
    },
  ],
})
