---
title: UnoCSS ESLint Config
description: ESLint config for UnoCSS (@unocss/eslint-config).
---

# ESLint Config

ESLint config for UnoCSS: `@unocss/eslint-config`.

## Installation

::: code-group
  ```bash [pnpm]
  pnpm add -D @unocss/eslint-config
  ```
  ```bash [yarn]
  yarn add -D @unocss/eslint-config
  ```
  ```bash [npm]
  npm install -D @unocss/eslint-config
  ```
:::

In [Flat Config Style](https://eslint.org/docs/latest/use/configure/configuration-files-new):

```js
// eslint.config.js
import unocss from '@unocss/eslint-config/flat'

export default [
  unocss,
  // other configs
]
```

In legacy `.eslintrc` style:

```json
{
  "extends": [
    "@unocss"
  ]
}
```

## Rules

- `@unocss/order` - Enforce a specific order for class selectors.
- `@unocss/order-attributify` - Enforce a specific order for attributify selectors.
- `@unocss/blocklist` - Disallow specific class selectors [Optional].
- `@unocss/enforce-class-compile` - Enforce class compile [Optional].

### Optional rules

These rules are not enabled by default. To enable it, add the following to your `.eslintrc`:

```json
{
  "extends": [
    "@unocss"
  ],
  "rules": {
    "@unocss/<rule-name>": "warn", // or "error",
    "@unocss/<another-rule-name>": ["warn" /* or "error" */, { /* options */ }]
  }
}
```

#### `@unocss/blocklist`

Throw warning or error when using utilities listed in `blocklist` get matched.

You can customize messages for blocked rules to make them more informative and context-specific by using the `message` property of the meta object:

```ts
// uno.config.ts
export default defineConfig({
  blocklist: [
    ['bg-red-500', { message: 'Use bg-red-600 instead' }],
    [/-auto$/, { message: s => `Use ${s.replace(/-auto$/, '-a')} instead` }], // -> "my-auto" is in blocklist: Use "my-a" instead
  ],
})
```

#### `@unocss/enforce-class-compile` :wrench:

_This rule is designed to work in combination with [compile class transformer](https://unocss.dev/transformers/compile-class)._

Throw warning or error when class attribute or directive doesn't start with `:uno:`.

:wrench: automatically adds prefix `:uno:` to all class attributes and directives.

Options:

- `prefix` (string) - can be used in combination with [custom prefix](https://github.com/unocss/unocss/blob/main/packages/transformer-compile-class/src/index.ts#L34). Default: `:uno:`
- `enableFix` (boolean) - can be used for gradual migration when `false`. Default: `true`

**Note**: currently only Vue supported. _Contribute a PR_ if you want this in JSX. If you're looking for this in Svelte, you might be looking for [`svelte-scoped`](https://unocss.dev/integrations/svelte-scoped) mode.

## Prior Arts

Thanks to [eslint-plugin-unocss](https://github.com/devunt/eslint-plugin-unocss) by [@devunt](https://github.com/devunt).
