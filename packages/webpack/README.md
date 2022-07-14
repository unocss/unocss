# @unocss/webpack

The Webpack plugin for UnoCSS.

> This plugin does not come with any default presets.

Currently, this plugin only supports [the `global` mode](https://github.com/unocss/unocss/blob/main/packages/vite/src/types.ts#L11-L21)

## Installation

```bash
npm i -D unocss @unocss/webpack
```

```ts
// webpack.config.js
const UnoCSS = require('unocss/webpack').default

module.exports = {
  plugins: [
    UnoCSS({ /* options */ }),
  ],
}
```

Add `uno.css` to your main entry:

```ts
// main.ts
import 'uno.css'
```

Or you can have the config file in `unocss.config.js` or `unocss.config.ts`.

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
