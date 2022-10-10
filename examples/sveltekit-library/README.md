# SvelteKit Component Library + @unocss/svelte-preprocess-unocss

Works the same as the UnoCSS Vite plugin's `svelte-scoped` mode except it is a Svelte preprocessor instead of a Vite plugin. This wrapper was created to enable component libraries built using `svelte-package` to still use UnoCSS.

## Installation

```bash
npm i -D unocss @unocss/svelte-preprocess-unocss
```

```ts
// svelte.config.js
import adapter from '@sveltejs/adapter-auto'
import preprocess from 'svelte-preprocess'
import UnoCSS from '@unocss/svelte-preprocess-unocss'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    preprocess(),
    UnoCSS({
      // add options,
    }),
  ],

  kit: {
    adapter: adapter(),
  },
}

export default config
```