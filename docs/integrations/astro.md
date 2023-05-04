---
title: UnoCSS Astro Integration
description: The UnoCSS integration for Astro (@unocss/astro).
---

# Astro Integration

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
import { defineConfig } from 'astro/config'
import UnoCSS from 'unocss/astro'

export default defineConfig({
  integrations: [
    UnoCSS(),
  ],
})
```

Create a `uno.config.ts` file:

```ts
// uno.config.ts
import { defineConfig } from 'unocss'

export default defineConfig({
  // ...UnoCSS options
})
```

### Style Reset

By default, [browser style reset](/guide/style-reset) will not be injected. To enable it, install the `@unocss/reset` package:

::: code-group
  ```bash [pnpm]
  pnpm add -D @unocss/reset
  ```
  ```bash [yarn]
  yarn add -D @unocss/reset
  ```
  ```bash [npm]
  npm install -D @unocss/reset
  ```
:::

And update your `astro.config.ts`:

```ts
// astro.config.ts
import { defineConfig } from 'astro/config'
import UnoCSS from 'unocss/astro'

export default defineConfig({
  integrations: [
    UnoCSS({
      injectReset: true // or a path to the reset file
    }),
  ],
})
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
    UnoCSS(),
  ],
}
```

For more details, please refer to the [Vite plugin](/integrations/vite).

::: info
If you are building a meta framework on top of UnoCSS, see [this file](https://github.com/unocss/unocss/blob/main/packages/unocss/src/astro.ts) for an example on how to bind the default presets.
:::

## Notes

[`client:only`](https://docs.astro.build/en/reference/directives-reference/#clientonly) components must be placed in [`components`](https://docs.astro.build/en/core-concepts/project-structure/#srccomponents) folder or added to UnoCSS's `extraContent` config in order to be processed.
