---
title: UnoCSS Nuxt Module
description: Nuxt module for UnoCSS.
---

# Nuxt Module

The Nuxt module for UnoCSS.

## Installation

::: code-group

```bash [pnpm]
pnpm add -D unocss @unocss/nuxt
```

```bash [yarn]
yarn add -D unocss @unocss/nuxt
```

```bash [npm]
npm install -D unocss @unocss/nuxt
```

```bash [bun]
bun add -D unocss @unocss/nuxt
```

:::

Add `@unocss/nuxt` to your Nuxt config file:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: [
    '@unocss/nuxt',
  ],
})
```

Create a `uno.config.ts` file:

```ts [uno.config.ts]
import { defineConfig } from 'unocss'

export default defineConfig({
  // ...UnoCSS options
})
```

The `uno.css` entry will be automatically injected by the module.

## Support status

|               | Nuxt 2 | Nuxt Bridge | Nuxt 3 |
| ------------- | :----- | :---------- | :----- |
| Webpack Dev   | ✅     | ✅          | 🚧     |
| Webpack Build | ✅     | ✅          | ✅     |
| Vite Dev      | -      | ✅          | ✅     |
| Vite Build    | -      | ✅          | ✅     |

## Configuration

We recommend to use the dedicated `uno.config.ts` file for configuration. See [Config File](/guide/config-file) for more details.

You can enable the `nuxtLayers` option, so Nuxt will automatically merge `uno.config` files from each Nuxt layer:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  // ...
  unocss: {
    nuxtLayers: true,
  },
})
```

then you can reexport the generated config in the root config file:

```ts [uno.config.ts]
import config from './.nuxt/uno.config.mjs'

export default config
```

or modify/extend it:

```ts
import { mergeConfigs } from '@unocss/core'
import config from './.nuxt/uno.config.mjs'

export default mergeConfigs([config, {
  // your overrides
}])
```

### Inline CSS

By default the generated CSS is served as a stylesheet linked from the page. To inline it into a `<style>` tag in the HTML head instead, which saves a request before the first paint, enable the `inlineCss` option:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  // ...
  unocss: {
    inlineCss: true,
  },
})
```

This only works with Vite and the default `global` mode, and only affects production builds. Your other styles keep following Nuxt's [`features.inlineStyles`](https://nuxt.com/docs/4.x/api/nuxt-config#inlinestyles).

## License

- MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
