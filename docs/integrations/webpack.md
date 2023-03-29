---
title: UnoCSS Webpack Plugin
description: The webpack plugin for UnoCSS (@unocss/webpack).
---

# Webpack Plugin

The webpack plugin for UnoCSS: `@unocss/webpack`. Currently, this plugin only supports the [`global` mode](https://github.com/unocss/unocss/blob/main/packages/vite/src/types.ts#L11-L21).

::: info
This plugin does not come with any default presets.
:::

## Installation

::: code-group
  ```bash [pnpm]
  pnpm add -D @unocss/webpack
  ```
  ```bash [yarn]
  yarn add -D @unocss/webpack
  ```
  ```bash [npm]
  npm install -D @unocss/webpack
  ```
:::

::: code-group
```ts [webpack 5]
// webpack.config.js
const UnoCSS = require('@unocss/webpack').default

module.exports = {
  plugins: [
    UnoCSS(),
  ],
  optimization: {
    realContentHash: true,
  },
}
```

```ts [webpack 4]
// webpack.config.js
const UnoCSS = require('@unocss/webpack').default

module.exports = {
  plugins: [
    UnoCSS(),
  ],
  css: {
    extract: {
      filename: '[name].[hash:9].css',
    },
  },
}
```
:::

Create a `uno.config.ts` file:

```ts
// uno.config.ts
import { defineConfig } from 'unocss'

export default defineConfig({
  // ...UnoCSS options
})
```

::: warning
If you are using webpack@4.x, the `optimization.realContentHash` configuration is not supported, And you should use `css.extract.filename` to customize css filename (we use first 9 letter of hashcode instead of contenthash as example). Beware this [known issue](https://github.com/unocss/unocss/issues/1728) with bundle and [webpack#9520](https://github.com/webpack/webpack/issues/9520#issuecomment-749534245).
:::

## Usage

Add `uno.css` to your main entry:

```ts
// main.ts
import 'uno.css'
```
