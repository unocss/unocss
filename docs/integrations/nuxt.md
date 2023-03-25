---
title: Nuxt module
description: Nuxt module for UnoCSS (@unocss/nuxt).
---

# Nuxt

The Nuxt module for UnoCSS: `@unocss/nuxt`. This is the simplest way to use UnoCSS in your Nuxt project.

## Support status

| | Nuxt 2 | Nuxt Bridge | Nuxt 3 |
| --- | :-- | :-- | :-- |
| Webpack Dev | ✅ | ✅ | 🚧 |
| Webpack Build | ✅ | ✅ | ✅ |
| Vite Dev | - | ✅ | ✅ |
| Vite Build | - | ✅ | ✅ |

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

```js
// nuxt.config.ts
export default {
  modules: [
    '@unocss/nuxt',
  ],
}
```

## Configuration

In the Nuxt module, we also provided some shortcuts for official presets:

```js
// nuxt.config.ts
export default {
  modules: [
    '@unocss/nuxt',
  ],
  unocss: {
    // presets
    uno: true, // enables `@unocss/preset-uno`
    icons: true, // enables `@unocss/preset-icons`
    attributify: true, // enables `@unocss/preset-attributify`,

    // core options
    shortcuts: [],
    rules: [],
  },
}
```

## License

- MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)