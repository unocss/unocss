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
const UnoCSS = require('@unocss/webpack').default

module.exports = {
  plugins: [
    UnoCSS({ /* options */ }),
  ],
  // for Webpack 4
  css: {
    extract: {
      filename: '[name].[hash:9].css',
    },
  },
  // for Webpack 5
  optimization: {
    realContentHash: true,
  },
}
```

> If you are using webpack@4.x, the `optimization.realContentHash` configuration is not supported, And you should use `css.extract.filename` to customize css filename(We use first 9 letter of hashcode instead of contenthash as example). Be aware of this [known issue](https://github.com/unocss/unocss/issues/1728) with bundle and [webpack#9520](https://github.com/webpack/webpack/issues/9520#issuecomment-749534245).

Add `uno.css` to your main entry:

```ts
// main.ts
import 'uno.css'
```

Or you can have the config file in `unocss.config.js` or `unocss.config.ts`.

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
