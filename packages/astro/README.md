# @unocss/astro

The UnoCSS integration for [Astro](https://astro.build/). Check [the example](../../examples/astro/).

## Installation

```bash
npm i -D unocss
```

```ts
// astro.config.ts
import UnoCSS from 'unocss/astro'

export default {
  integrations: [
    UnoCSS({ /* options */ }),
  ],
}
```

### Presetless usage

> This plugin does not come with any default presets.
> If you are building a meta framework on top of UnoCSS, see [this file](https://github.com/unocss/unocss/blob/main/packages/unocss/src/astro.ts) for an example to bind the default presets.

```bash
npm i -D @unocss/astro
```

```ts
// astro.config.mjs
import UnoCSS from '@unocss/astro'

export default {
  integrations: [
    UnoCSS({
      presets: [
        /* no presets by default */
      ],
      /* options */
    }),
  ],
}
```

for more details, please refer to the [Vite plugin](../vite).

## Notes

[`client:only`](https://docs.astro.build/en/reference/directives-reference/#clientonly) components must be placed in [`components`](https://docs.astro.build/en/core-concepts/project-structure/#srccomponents) folder or added to UnoCSS's `extraContent` config in order to be processed.

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
