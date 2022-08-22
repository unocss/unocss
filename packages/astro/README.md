# @unocss/astro

The UnoCSS intration for Astro.

> This plugin does not come with any default presets.

## Installation

```bash
npm i -D @unocss/astro
```

```ts
// astro.config.ts
import { defineConfig } from 'astro'
import UnoCSS from '@unocss/astro'

export default defineConfig({
  integrations: [
    UnoCSS({ /* options */ }),
  ],
})
```

for more details, please refer to the [Vite plugin](../vite).

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
