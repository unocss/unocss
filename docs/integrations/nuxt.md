---
title: Nuxt module
description: Nuxt module for UnoCSS.
---

# Nuxt Integration

The Nuxt module for UnoCSS.

## Installation

::: code-group
  ```bash [pnpm]
  pnpm add -D @unocss/nuxt
  ```
  ```bash [yarn]
  yarn add -D @unocss/nuxt
  ```
  ```bash [npm]
  npm install -D @unocss/nuxt
  ```
:::

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@unocss/nuxt',
  ],
})
```

## Support status

| | Nuxt 2 | Nuxt Bridge | Nuxt 3 |
| --- | :-- | :-- | :-- |
| Webpack Dev | ✅ | ✅ | 🚧 |
| Webpack Build | ✅ | ✅ | ✅ |
| Vite Dev | - | ✅ | ✅ |
| Vite Build | - | ✅ | ✅ |

## Configuration

We recommend to use the dedicated `uno.config.ts` file for configuration. See [Config File](/guide/config-file) for more details.

## License

- MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
