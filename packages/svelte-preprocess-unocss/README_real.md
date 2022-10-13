# @unocss/svelte-preprocess-unocss

Run UnoCSS in `svelte-scoped` mode as a svelte preprocessor instead of as a Vite plugin (the normal method) to enable styles preprocessing in pipelines that don't use Vite, such as `svelte-package`.

## Installation

```
npm i -D @unocss/svelte-preprocess-unocss
```


## Configuration

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-auto'
import preprocess from 'svelte-preprocess'
import UnoCSS from '@unocss/svelte-preprocess-unocss'
import presetUno from '@unocss/preset-uno'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    preprocess(),
    UnoCSS({
      presets: [
        presetUno(),
      ],
      // add options,
    }),
  ],

  kit: {
    adapter: adapter(),
  },
}

export default config

```


## License

MIT License &copy; 2022-PRESENT [jacob-8](https://github.com/jacob-8)
