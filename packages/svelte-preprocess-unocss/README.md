# temp-s-p-u

## NOTE: This is a temporary package for testing until merged into UnoCSS. Don't expect it to be maintained! If you find this and want updates, please watch the Svelte portions of the [UnoCSS docs](https://github.com/unocss/unocss).

Until https://github.com/sveltejs/vite-plugin-svelte/issues/475 is resolved, this allows you to run UnoCSS in `svelte-scoped` mode as a svelte preprocessor instead of as a Vite plugin (the normal method) to enable styles preprocessing in pipelines that don't use Vite, such as `svelte-package`.

## Installation

```
npm i -D temp-s-p-u
```

## Configuration

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-auto'
import preprocess from 'svelte-preprocess'
import UnoCSS from 'temp-s-p-u'

// If wanting to keep classes distinct during dev, turn your build/package script into `cross-env NODE_ENV=production svelte-kit sync && svelte-package`. Requires `cross-env` as a `devDependency`.
const mode = process.env.NODE_ENV
const prod = mode === 'production'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    preprocess(),
    UnoCSS({
      options: {
        classPrefix: 'sk-',
        combine: prod,
      },
    }),
  ],

  kit: {
    adapter: adapter(),
  },
}

export default config
```

Uno config must be placed in `unocss.config.ts` file since options are passed in `svelte.config.js`

```ts
// unocss.config.ts
import { defineConfig, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      prefix: 'i-',
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
})
```


## License

MIT License &copy; 2022-PRESENT [jacob-8](https://github.com/jacob-8)
