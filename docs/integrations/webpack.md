---
title: UnoCSS Webpack Plugin
description: The webpack plugin for UnoCSS (@unocss/webpack).
outline: deep
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

From UnoCSS version `v0.59.0`, UnoCSS has been moved to ESM-only, you need to load your configuration via dynamic import:

::: code-group
```ts [webpack 5]
// webpack.config.js
module.exports = function () {
  return import('@unocss/webpack').then(({ default: UnoCSS }) => ({
    plugins: [
      UnoCSS()
    ],
    optimization: {
      realContentHash: true
    }
  }))
}
```

```js [webpack 4]
// webpack.config.js
module.exports = function () {
  return import('@unocss/webpack').then(({ default: UnoCSS }) => ({
    plugins: [
      UnoCSS()
    ],
    css: {
      extract: {
        filename: '[name].[hash:9].css'
      },
    },
  }))
}
```
:::

If you're using older version of UnoCSS, you can use the following code:

::: code-group
```ts [webpack 5]
// webpack.config.js
const UnoCSS = require('@unocss/webpack').default

module.exports = {
  plugins: [
    UnoCSS()
  ],
  optimization: {
    realContentHash: true
  }
}
```

```js [webpack 4]
// webpack.config.js
const UnoCSS = require('@unocss/webpack').default

module.exports = {
  plugins: [
    UnoCSS()
  ],
  css: {
    extract: {
      filename: '[name].[hash:9].css'
    }
  }
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
If you are using webpack@4.x, the `optimization.realContentHash` configuration is not supported, And you should use `css.extract.filename` to customize CSS filename (we use first 9 letter of hashcode instead of contenthash as example). Beware this [known issue](https://github.com/unocss/unocss/issues/1728) with bundle and [webpack#9520](https://github.com/webpack/webpack/issues/9520#issuecomment-749534245).
:::

## Usage

Add `uno.css` to your main entry:

```ts
// main.ts
import 'uno.css'
```

## Frameworks

### Vue + Vue CLI

If you're using [Vue CLI](https://cli.vuejs.org/) with webpack 4/5 with UnoCSS `v0.59.0`, you need to use the latest [Vue CLI Service](https://cli.vuejs.org/guide/cli-service.html) `v5.0.8` to load your configuration with dynamic import:

::: code-group
```ts [webpack 5]
// vue.config.js
const process = require('node:process')

module.exports = function () {
  return import('@unocss/webpack').then(({ default: UnoCSS }) => ({
    configureWebpack: {
      devtool: 'inline-source-map',
      plugins: [
        UnoCSS()
      ],
      optimization: {
        realContentHash: true
      }
    },
    chainWebpack(config) {
      config.module.rule('vue').uses.delete('cache-loader')
      config.module.rule('tsx').uses.delete('cache-loader')
      config.merge({
        cache: false
      })
    },
    css: {
      extract: process.env.NODE_ENV === 'development'
        ? {
            filename: 'css/[name].css',
            chunkFilename: 'css/[name].css'
          }
        : true
    }
  }))
}
```

```ts [webpack 4]
// vue.config.js
const process = require('node:process')

module.exports = function () {
  return import('@unocss/webpack').then(({ default: UnoCSS }) => ({
    configureWebpack: {
      plugins: [
        UnoCSS({})
      ]
    },
    chainWebpack(config) {
      config.module.rule('vue').uses.delete('cache-loader')
      config.module.rule('tsx').uses.delete('cache-loader')
      config.merge({
        cache: false
      })
    },
    css: {
      extract: process.env.NODE_ENV === 'development'
        ? {
            filename: '[name].css',
            chunkFilename: '[name].[hash:9].css'
          }
        : true
    }
  }))
}
```
:::

If using an older version of UnoCSS, you can use the following code:

::: code-group
```ts [webpack 5]
// vue.config.js
const process = require('node:process')
const UnoCSS = require('@unocss/webpack').default

module.exports = {
  configureWebpack: {
    devtool: 'inline-source-map',
    plugins: [
      UnoCSS()
    ],
    optimization: {
      realContentHash: true
    }
  },
  chainWebpack(config) {
    config.module.rule('vue').uses.delete('cache-loader')
    config.module.rule('tsx').uses.delete('cache-loader')
    config.merge({
      cache: false
    })
  },
  css: {
    extract: process.env.NODE_ENV === 'development'
      ? {
          filename: 'css/[name].css',
          chunkFilename: 'css/[name].css'
        }
      : true
  },
}
```

```ts [webpack 4]
// vue.config.js
const process = require('node:process')
const UnoCSS = require('@unocss/webpack').default

module.exports = {
  configureWebpack: {
    plugins: [
      UnoCSS({}),
    ]
  },
  chainWebpack(config) {
    config.module.rule('vue').uses.delete('cache-loader')
    config.module.rule('tsx').uses.delete('cache-loader')
    config.merge({
      cache: false,
    })
  },
  css: {
    extract: process.env.NODE_ENV === 'development'
      ? {
          filename: '[name].css',
          chunkFilename: '[name].[hash:9].css',
        }
      : true,
  },
}
```
:::
