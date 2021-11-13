# @unocss/webpack

The Webpack plugin for UnoCSS.

> This plugin does not come with any default presets.

## Installation

```bash
npm i -D @unocss/webpack
```

```ts
// webpack.config.js
const UnoCSS = require('@unocss/webpack').default

module.exports = {
  plugins: [
    UnoCSS({ /* options */ })
  ]
}
```

Or you can have the config file in `unocss.config.js` or `unocss.config.ts`.
