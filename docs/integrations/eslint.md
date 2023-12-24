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

### `@unocss/blocklist`

Throw warning or error when using utilities listed in `blocklist` get matched.

This rule is not enabled by default. To enable it, add the following to your `.eslintrc`:

```json
{
  "extends": [
    "@unocss"
  ],
  "rules": {
    "@unocss/blocklist": "warn" // or "error"
  }
}
```

## Prior Arts

Thanks to [eslint-plugin-unocss](https://github.com/devunt/eslint-plugin-unocss) by [@devunt](https://github.com/devunt).
