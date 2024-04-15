import { RuleTester } from 'eslint'
import * as vueParser from 'vue-eslint-parser'

import rule from '../../src/rules/enforce-class-compile'

import { html } from '../utils/html'

const vueTester = new RuleTester({
  languageOptions: {
    parser: vueParser,
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
    },
  },
})

vueTester.run('enforce-class-compile', rule as any, {
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
      errors: [
        {
          messageId: 'missing',
          data: { prefix: ':uno:' },
          line: 3,
          column: 12,
          endLine: 3,
          endColumn: 18,
        },
      ],
      output: html`
        <template>
          <div class=":uno: mr-1"></div>
        </template>
      `,
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
          line: 3,
          column: 14,
          endLine: 3,
          endColumn: 20,
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
          line: 3,
          column: 26,
          endLine: 3,
          endColumn: 32,
        },
        {
          messageId: 'missing',
          data: { prefix: ':uno:' },
          line: 3,
          column: 35,
          endLine: 3,
          endColumn: 41,
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
          line: 3,
          column: 15,
          endLine: 3,
          endColumn: 21,
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
          line: 3,
          column: 15,
          endLine: 3,
          endColumn: 19,
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
          line: 3,
          column: 15,
          endLine: 3,
          endColumn: 19,
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
          line: 3,
          column: 14,
          endLine: 3,
          endColumn: 20,
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
          line: 3,
          column: 14,
          endLine: 3,
          endColumn: 20,
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
          line: 3,
          column: 12,
          endLine: 3,
          endColumn: 18,
        },
      ],
      output: null,
    },
  ],
})
