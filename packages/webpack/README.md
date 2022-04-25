# @unocss/webpack

The Webpack plugin for UnoCSS.

> This plugin does not come with any default presets.

Currently, this plugin only supports [the `global` mode](https://github.com/unocss/unocss/blob/main/packages/vite/src/types.ts#L11-L21)

## Installation

```bash
npm i -D @unocss/webpack
```

```ts
// webpack.config.js
const UnoCSS = require('@unocss/webpack').default

module.exports = {
  plugins: [
    UnoCSS({ /* options */ }),
  ],
}
```

Or you can have the config file in `unocss.config.js` or `unocss.config.ts`.
