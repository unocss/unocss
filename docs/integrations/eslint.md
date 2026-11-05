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

```bash [bun]
bun add -D @unocss/eslint-config
```

:::

In [Flat Config Style](https://eslint.org/docs/latest/use/configure/configuration-files-new):

```js [eslint.config.js]
import unocss from '@unocss/eslint-config/flat'

export default [
  unocss,
  // other configs
]
```

In legacy `.eslintrc` style:

```json [.eslintrc]
{
  "extends": [
    "@unocss"
  ]
}
```

## Rules

The rule prefix depends on the ESLint configuration style:

- Flat config: `unocss/<rule-name>`
- Legacy `.eslintrc`: `@unocss/<rule-name>`

Available rules:

- `order` - Enforce a specific order for class selectors, including the values of prefixed attributify attributes (e.g. `un-before="..."`).
- `order-attributify` - Enforce a specific order for attributify selectors.
- `blocklist` - Disallow specific class selectors [Optional].
- `enforce-class-compile` - Enforce class compile [Optional].

`order-attributify` orders attributify attributes themselves. The utilities inside the value of prefixed attributes, such as `un-before="text-center font-sans color-gray"`, are sorted by `order`. The prefix is read from the `prefix` option of `presetAttributify` in your UnoCSS configuration, defaulting to `un-`. An empty prefix disables sorting of attribute values other than `class`. Other attributify values are not sorted yet.

### Rule options

#### `order`

- `unoFunctions` (string[]) - mark function calls of matched names to enforce this rule. These are plain names, not patterns, case insensitive. Default: `['clsx', 'classnames']`.
- `unoVariables` (string[]) - mark variable declarations of matched names to enforce this rule. These are regex patterns with flags `i`. Default: `['^cls', 'classNames?$']`. for example will match variable names `clsButton` and `buttonClassNames`.

### Optional rules

These rules are not enabled by default. To enable them, add the following to your flat config or `.eslintrc`:

```js [eslint.config.js]
import unocss from '@unocss/eslint-config/flat'

export default [
  unocss,
  {
    rules: {
      'unocss/<rule-name>': 'warn', // or "error",
      'unocss/<another-rule-name>': ['warn' /* or "error" */, { /* options */ }],
    },
  },
]
```

```json [.eslintrc]
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

```ts [unocss.config.ts]
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

- `prefix` (string) - can be used in combination with [custom prefix](https://github.com/unocss/unocss/blob/main/packages-presets/transformer-compile-class/src/index.ts#L34). Default: `:uno:`
- `enableFix` (boolean) - can be used for gradual migration when `false`. Default: `true`

**Note**: currently only Vue supported. _Contribute a PR_ if you want this in JSX. If you're looking for this in Svelte, you might be looking for [`svelte-scoped`](https://unocss.dev/integrations/svelte-scoped) mode.

## Usage with Oxlint

The plugin can also run in [Oxlint](https://oxc.rs/docs/guide/usage/linter) through its [JS plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins) support. Install `@unocss/eslint-plugin` directly:

::: code-group

```bash [pnpm]
pnpm add -D oxlint @unocss/eslint-plugin
```

```bash [yarn]
yarn add -D oxlint @unocss/eslint-plugin
```

```bash [npm]
npm install -D oxlint @unocss/eslint-plugin
```

```bash [bun]
bun add -D oxlint @unocss/eslint-plugin
```

:::

Then enable the rules in your Oxlint config. The rule prefix is `unocss/`:

```json [.oxlintrc.json]
{
  "jsPlugins": ["@unocss/eslint-plugin"],
  "rules": {
    "unocss/order": "warn",
    "unocss/order-attributify": "warn",
    "unocss/blocklist": "error"
  }
}
```

To use a custom UnoCSS config path, set it in `settings`:

```json [.oxlintrc.json]
{
  "jsPlugins": ["@unocss/eslint-plugin"],
  "settings": {
    "unocss": {
      "configPath": "./config/uno.config.ts"
    }
  }
}
```

::: warning
JS plugins in Oxlint are still experimental. The rules work in JS, TS, JSX and TSX files, and autofix with `oxlint --fix` is supported. Vue and Svelte templates are not linted yet, because Oxlint doesn't support custom parsers ([oxc#15761](https://github.com/oxc-project/oxc/issues/15761)).
:::

## Prior Arts

Thanks to [eslint-plugin-unocss](https://github.com/devunt/eslint-plugin-unocss) by [@devunt](https://github.com/devunt).
