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
    html`
      <template>
        <div class="m-class f-class"></div>
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
      <div className="m-class f-class"></div>
    `,
    html`
      <div className={"m1 mx1 mr-1"}></div>
    `,
    html`
      <div className={\`m1 mx1 mr-1\`}></div>
    `,
    html`
      <div className={\`m1 mx1 mr-1 \${more}\`}></div>
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
    {
      code: html`
        <div className={\`mx1 m1 mr-1\`}></div>
      `,
      output: output => expect(output).toMatchInlineSnapshot(`
       "<div className={\`m1 mx1 mr-1\`}></div>"
      `),
      errors: [
        {
          messageId: 'invalid-order',
        },
      ],
    },
    {
      code: html`
        <div className={\`mx1 m1 mr-1 \${more}\`}></div>
      `,
      output: output => expect(output).toMatchInlineSnapshot(`
       "<div className={\`m1 mx1 mr-1 \${more}\`}></div>"
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

run({
  name: 'order-unoFunctions',
  rule,
  settings: {
    unocss: {
      configPath: fileURLToPath(new URL('./uno.config.ts', import.meta.url)),
    },
  },
  valid: [
    `clsx('ml-1 mr-1')`,
    `clsx('pl1 pr1', test ? 'ml-1 mr-1' : 'left-1 right-1', 'bottom-1 top-1')`,
    `clsx('pl1 pr1', test ? 'ml-1 mr-1' : 'left-1 right-1', test && 'bottom-1 top-1', { 'bottom-1 top-1': test })`,
    'clsx(`pl1 pr1`, test ? `ml-1 mr-1` : `left-1 right-1`, test && `bottom-1 top-1`, { [`bottom-1 top-1`]: test })',
    'clsx(String.raw`pl1 pr1`, test ? String.raw`ml-1 mr-1` : String.raw`left-1 right-1`, test && String.raw`bottom-1 top-1`, { [String.raw`bottom-1 top-1`]: test })',
    'clsx(String.raw`bg-[var(--some\_variable\_with\_underscore)] pl1 pr1`)',
    { code: `superclass('pl1 pr1', test ? 'ml-1 mr-1' : 'left-1 right-1', 'bottom-1 top-1')`, options: [{ unoFunctions: ['superclass'] }] },
    { code: `abc('pl1 pr1', test ? 'ml-1 mr-1' : 'left-1 right-1', test && 'bottom-1 top-1', { 'bottom-1 top-1': test })`, options: [{ unoFunctions: ['abc'] }] },
    { code: `cva({ variants: { size: { small: 'text-sm px-2 py-1', medium: 'text-base px-4 py-2' } } })`, options: [{ unoFunctions: ['cva'] }] },
    { code: `cva('bottom-1 top-1', { variants: { size: { small: 'text-sm px-2 py-1', medium: 'text-base px-4 py-2' } } })`, options: [{ unoFunctions: ['cva'] }] },
    { code: `tv({ base: 'bottom-1 top-1', variants: { size: { small: 'text-sm px-2 py-1', medium: 'text-base px-4 py-2' } } })`, options: [{ unoFunctions: ['tv'] }] },
    // eslint-disable-next-line no-template-curly-in-string
    'clsx(`pl1 pr1 ${more}`, test ? `ml-1 mr-1 ${more}` : `left-1 right-1 ${more}`, test && `bottom-1 top-1 ${more}`, { [`bottom-1 top-1 ${more}`]: test })',
    `notSorted('mr-1 ml-1')`,
  ],
  invalid: [
    {
      code: `clsx('mr-1 ml-1')`,
      output: output => expect(output).toMatchInlineSnapshot(`
            "clsx('ml-1 mr-1')"
      `),
      errors: [
        {
          messageId: 'invalid-order',
        },
      ],
    },
    {
      code: `clsx('pr1 pl1', test ? 'mr-1 ml-1' : 'right-1 left-1', test && 'top-1 bottom-1', { 'top-1 bottom-1': test })`,
      output: output => expect(output).toMatchInlineSnapshot(`
            "clsx('pl1 pr1', test ? 'ml-1 mr-1' : 'left-1 right-1', test && 'bottom-1 top-1', { 'bottom-1 top-1': test })"
      `),
      errors: [
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
      ],
    },
    {
      code: 'clsx(`pr1 pl1`, test ? `mr-1 ml-1` : `right-1 left-1`, test && `top-1 bottom-1`, { [`top-1 bottom-1`]: test })',
      output: output => expect(output).toMatchInlineSnapshot(
        '   "clsx(`pl1 pr1`, test ? `ml-1 mr-1` : `left-1 right-1`, test && `bottom-1 top-1`, { [`bottom-1 top-1`]: test })"',
      ),
      errors: [
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
      ],
    },
    {
      code: 'clsx(String.raw`pr1 pl1`, test ? String.raw`mr-1 ml-1` : String.raw`right-1 left-1`, test && String.raw`top-1 bottom-1`, { [String.raw`top-1 bottom-1`]: test })',
      output: output => expect(output).toMatchInlineSnapshot(
        '   "clsx(String.raw`pl1 pr1`, test ? String.raw`ml-1 mr-1` : String.raw`left-1 right-1`, test && String.raw`bottom-1 top-1`, { [String.raw`bottom-1 top-1`]: test })"',
      ),
      errors: [
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
      ],
    },
    {
      options: [{ unoFunctions: ['superclass'] }],
      code: `superclass('pr1 pl1', test ? 'mr-1 ml-1' : 'right-1 left-1', test && 'top-1 bottom-1', { 'top-1 bottom-1': test })`,
      output: output => expect(output).toMatchInlineSnapshot(`
            "superclass('pl1 pr1', test ? 'ml-1 mr-1' : 'left-1 right-1', test && 'bottom-1 top-1', { 'bottom-1 top-1': test })"
      `),
      errors: [
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
      ],
    },
    {
      options: [{ unoFunctions: ['cva'] }],
      code: `cva({ variants: { size: { small: 'px-2 text-sm py-1', medium: 'px-4 text-base py-2' } } })`,
      output: output => expect(output).toMatchInlineSnapshot(`
            "cva({ variants: { size: { small: 'text-sm px-2 py-1', medium: 'text-base px-4 py-2' } } })"
      `),
      errors: [
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
      ],
    },
    {
      options: [{ unoFunctions: ['cva'] }],
      code: `cva('top-1 bottom-1', { variants: { size: { small: 'px-2 text-sm py-1', medium: 'px-4 text-base py-2' } } })`,
      output: output => expect(output).toMatchInlineSnapshot(`
            "cva('bottom-1 top-1', { variants: { size: { small: 'text-sm px-2 py-1', medium: 'text-base px-4 py-2' } } })"
      `),
      errors: [
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
      ],
    },
    {
      options: [{ unoFunctions: ['tv'] }],
      code: `tv({ base: 'top-1 bottom-1', variants: { size: { small: 'px-2 text-sm py-1', medium: 'px-4 text-base py-2' } } })`,
      output: output => expect(output).toMatchInlineSnapshot(`
            "tv({ base: 'bottom-1 top-1', variants: { size: { small: 'text-sm px-2 py-1', medium: 'text-base px-4 py-2' } } })"
      `),
      errors: [
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
      ],
    },
    {
      // eslint-disable-next-line no-template-curly-in-string
      code: 'clsx(`pr1 pl1 ${more}`, test ? `mr-1 ml-1 ${more}` : `right-1 left-1 ${more}`, test && `top-1 bottom-1 ${more}`, { [`top-1 bottom-1 ${more}`]: test })',
      output: output => expect(output).toMatchInlineSnapshot(
        // eslint-disable-next-line no-template-curly-in-string
        '   "clsx(`pl1 pr1 ${more}`, test ? `ml-1 mr-1 ${more}` : `left-1 right-1 ${more}`, test && `bottom-1 top-1 ${more}`, { [`bottom-1 top-1 ${more}`]: test })"',
      ),
      errors: [
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
      ],
    },
    {
      // eslint-disable-next-line no-template-curly-in-string
      code: 'clsx(`pr1 pl1 ${more} none-uno-class mr-1 ml-1 ${more} none-uno-class2`)',
      output: output => expect(output).toMatchInlineSnapshot(
        // eslint-disable-next-line no-template-curly-in-string
        '   "clsx(`pl1 pr1 ${more} none-uno-class ml-1 mr-1 ${more} none-uno-class2`)"',
      ),
      errors: [
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
      ],
    },
  ],
})

run({
  name: 'order-unoVariables',
  rule,
  settings: {
    unocss: {
      configPath: fileURLToPath(new URL('./uno.config.ts', import.meta.url)),
    },
  },
  valid: [
    `const clsButton = 'ml-1 mr-1'`,
    // eslint-disable-next-line no-template-curly-in-string
    'const clsButton = `ml-1 mr-1 ${more}`',
    `const notSorted = 'mr-1 ml-1'`,
    `const buttonClassNames = { default: 'pl1 pr1', variants: { light: 'ml-1 mr-1', dark: 'left-1 right-1' } }`,
    { code: `const CLS_BUTTON = 'ml-1 mr-1'`, options: [{ unoVariables: ['^CLS_'] }] },
    { code: `const CLS_BUTTON = { default: 'pl1 pr1', variants: { light: 'ml-1 mr-1', dark: 'left-1 right-1' } }`, options: [{ unoVariables: ['^CLS_'] }] },
  ],
  invalid: [
    {
      code: `const clsButton = 'mr-1 ml-1'`,
      output: output => expect(output).toMatchInlineSnapshot(`
            "const clsButton = 'ml-1 mr-1'"
      `),
      errors: [
        { messageId: 'invalid-order' },
      ],
    },
    {
      // eslint-disable-next-line no-template-curly-in-string
      code: 'const clsButton = `mr-1 ml-1 ${more}`',
      output: output => expect(output).toMatchInlineSnapshot(
        // eslint-disable-next-line no-template-curly-in-string
        '   "const clsButton = `ml-1 mr-1 ${more}`"   ',
      ),
      errors: [
        { messageId: 'invalid-order' },
      ],
    },
    {
      // eslint-disable-next-line no-template-curly-in-string
      code: 'const clsButton = `pr1 pl1 ${more} none-uno-class mr-1 ml-1 ${more} none-uno-class2`',
      output: output => expect(output).toMatchInlineSnapshot(
        // eslint-disable-next-line no-template-curly-in-string
        '   "const clsButton = `pl1 pr1 ${more} none-uno-class ml-1 mr-1 ${more} none-uno-class2`"  ',
      ),
      errors: [
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
      ],
    },
    {
      code: `const buttonClassNames = { default: 'pr1 pl1', variants: { light: 'mr-1 ml-1', dark: 'right-1 left-1' } }`,
      output: output => expect(output).toMatchInlineSnapshot(`
            "const buttonClassNames = { default: 'pl1 pr1', variants: { light: 'ml-1 mr-1', dark: 'left-1 right-1' } }"
      `),
      errors: [
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
      ],
    },
    {
      options: [{ unoVariables: ['^CLS_'] }],
      code: `const CLS_BUTTON = 'mr-1 ml-1'`,
      output: output => expect(output).toMatchInlineSnapshot(`
            "const CLS_BUTTON = 'ml-1 mr-1'"
      `),
      errors: [
        { messageId: 'invalid-order' },
      ],
    },
    {
      options: [{ unoVariables: ['^CLS_'] }],
      code: `const CLS_BUTTON = { default: 'pr1 pl1', variants: { light: 'mr-1 ml-1', dark: 'right-1 left-1' } }`,
      output: output => expect(output).toMatchInlineSnapshot(`
            "const CLS_BUTTON = { default: 'pl1 pr1', variants: { light: 'ml-1 mr-1', dark: 'left-1 right-1' } }"
      `),
      errors: [
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
        { messageId: 'invalid-order' },
      ],
    },
  ],
})
