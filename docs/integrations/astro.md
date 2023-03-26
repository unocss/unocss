---
title: Astro
description: The UnoCSS integration for Astro (@unocss/astro).
---

# Astro

The UnoCSS integration for [Astro](https://astro.build/): `@unocss/astro`. Check the [example](https://github.com/unocss/unocss/tree/main/examples/astro).

## Installation

::: code-group
  ```bash [pnpm]
  pnpm add -D unocss
  ```
  ```bash [yarn]
  yarn add -D unocss
  ```
  ```bash [npm]
  npm install -D unocss
  ```
:::

```ts
// astro.config.ts
import UnoCSS from 'unocss/astro'

export default {
  integrations: [
    UnoCSS({ /* options */ }),
  ],
}
```

### Usage without presets

This plugin does not come with any default presets.

::: code-group
  ```bash [pnpm]
  pnpm add -D @unocss/astro
  ```
  ```bash [yarn]
  yarn add -D @unocss/astro
  ```
  ```bash [npm]
  npm install -D @unocss/astro
  ```
:::

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

For more details, please refer to the [Vite plugin](/integrations/vite).

::: info
If you are building a meta framework on top of UnoCSS, see [this file](https://github.com/unocss/unocss/blob/main/packages/unocss/src/astro.ts) for an example on how to bind the default presets.
:::

## Notes

[`client:only`](https://docs.astro.build/en/reference/directives-reference/#clientonly) components must be placed in [`components`](https://docs.astro.build/en/core-concepts/project-structure/#srccomponents) folder or added to UnoCSS's `extraContent` config in order to be processed.

## License

- MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
