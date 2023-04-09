---
title: Pug extractor
description: Pug extractor for UnoCSS (@unocss/extractor-pug)
---

# Pug extractor

Support extracting classes from Pug template.

## Installation

::: code-group
  ```bash [pnpm]
  pnpm add -D @unocss/extractor-pug
  ```
  ```bash [yarn]
  yarn add -D @unocss/extractor-pug
  ```
  ```bash [npm]
  npm install -D @unocss/extractor-pug
  ```
:::

```ts
import { defineConfig } from 'unocss'
import extractorPug from '@unocss/extractor-pug'

export default defineConfig({
  extractors: [
    extractorPug(),
  ],
})
```
