---
title: Arbitrary Variants Extractor
---

# Arbitrary Variants Extractor

A more complex extractor to support arbitrary variants for utilities.

```html
<div class="[&>*]:m-1 [&[open]]:p-2"></div>
```

Will be captured with `[&>*]:m-1` and `[&[open]]:p-2` as variants.

This extractor is included in [`@unocss/preset-mini`](/presets/mini) as the default extractor. Normally you don't need to install this package manually.

## Installation

::: code-group
  ```bash [pnpm]
  pnpm add -D @unocss/extractor-arbitrary-variants
  ```
  ```bash [yarn]
  yarn add -D @unocss/extractor-arbitrary-variants
  ```
  ```bash [npm]
  npm install -D @unocss/extractor-arbitrary-variants
  ```
:::

```ts
import { defineConfig } from 'unocss'
import extractorArbitrary from '@unocss/extractor-arbitrary-variants'

export default defineConfig({
  extractors: [
    extractorArbitrary(),
  ],
})
```
