---
title: Eslint
description: The core engine of UnoCSS without any presets. It can be used as the engine of your own Atomic CSS framework.
---

# Eslint

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

In `.eslintrc`:

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

## Prior Arts

Thanks to [eslint-plugin-unocss](https://github.com/devunt/eslint-plugin-unocss) by [@devunt](https://github.com/devunt).

## License

- MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)

