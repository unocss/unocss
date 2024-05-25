---
title: Variant group transformer
description: Enables the variant group feature of Windi CSS for UnoCSS (@unocss/transformer-variant-group)
---

# Variant group transformer

Enables the [variant group feature](https://windicss.org/features/variant-groups.html) of Windi CSS for UnoCSS.

## Installation

::: code-group
  ```bash [pnpm]
  pnpm add -D @unocss/transformer-variant-group
  ```
  ```bash [yarn]
  yarn add -D @unocss/transformer-variant-group
  ```
  ```bash [npm]
  npm install -D @unocss/transformer-variant-group
  ```
:::

```ts
// uno.config.ts
import { defineConfig } from 'unocss'
import transformerVariantGroup from '@unocss/transformer-variant-group'

export default defineConfig({
  // ...
  transformers: [
    transformerVariantGroup(),
  ],
})
```

::: tip
This preset is included in the `unocss` package, you can also import it from there:

```ts
import { transformerVariantGroup } from 'unocss'
```
:::

## Usage

```html
<div class="hover:(bg-gray-400 font-medium) font-(light mono)"/>
```

Will be transformed to:

```html
<div class="hover:bg-gray-400 hover:font-medium font-light font-mono"/>
```

## License

- MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
