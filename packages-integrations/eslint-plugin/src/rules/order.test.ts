import { fileURLToPath } from 'node:url'
import { $ as html, run } from 'eslint-vitest-rule-tester'
import svelteParser from 'svelte-eslint-parser'
import { expect } from 'vitest'
import * as vueParser from 'vue-eslint-parser'
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

run({
  name: 'order-jsx',
  rule,
  languageOptions: {
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  settings: {
    unocss: {
      configPath: fileURLToPath(new URL('./uno.config.ts', import.meta.url)),
    },
  },
  valid: [
    html`
      <div className="m1 mx1 mr-1"></div>
    `,
    html`
      <div className={"m1 mx1 mr-1"}></div>
    `,
  ],
  invalid: [
    {
      code: html`
        <div className="mx1 m1 mr-1"></div>
      `,
      output: output => expect(output).toMatchInlineSnapshot(`
          "<div className="m1 mx1 mr-1"></div>"
      `),
      errors: [
        {
          messageId: 'invalid-order',
        },
      ],
    },
    {
      code: html`
        <div className={"mx1 m1 mr-1"}></div>
      `,
      output: output => expect(output).toMatchInlineSnapshot(`
          "<div className={"m1 mx1 mr-1"}></div>"
      `),
      errors: [
        {
          messageId: 'invalid-order',
        },
      ],
    },
  ],
})

run({
  name: 'order-svelte',
  rule,
  languageOptions: {
    parser: svelteParser,
  },
  settings: {
    unocss: {
      configPath: fileURLToPath(new URL('./uno.config.ts', import.meta.url)),
    },
  },
  valid: [
    html`
      <div class="ml-1 mr-1"></div>
    `,
    html`
      <div class="pl1 pr1 {test ? 'ml-1 mr-1' : 'left-1 right-1'}"></div>
    `,
  ],
  invalid: [
    {
      code: html`
        <div class="mr-1 ml-1"></div>
      `,
      output: output => expect(output).toMatchInlineSnapshot(`
          "<div class="ml-1 mr-1"></div>"
      `),
      errors: [
        {
          messageId: 'invalid-order',
        },
      ],
    },
    {
      code: html`
        <div class="pr1 pl1{test ? 'mr-1 ml-1' : 'right-1 left-1'}top-1 bottom-1"></div>
      `,
      output: output => expect(output).toMatchInlineSnapshot(`
          "<div class="pl1 pr1 {test ? 'ml-1 mr-1' : 'left-1 right-1'} bottom-1 top-1"></div>"
      `),
      errors: [
        {
          messageId: 'invalid-order',
        },
        {
          messageId: 'invalid-order',
        },
        {
          messageId: 'invalid-order',
        },
        {
          messageId: 'invalid-order',
        },
      ],
    },
  ],
})
