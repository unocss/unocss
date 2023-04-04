---
title: Pug extractor
description: Pug extractor for UnoCSS (@unocss/extractor-pug)
---

# Pug extractor

Pug extractor for UnoCSS: `@unocss/extractor-pug`.

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

## Usage

```ts
import { defineConfig } from 'unocss'
import { extractorSplit } from '@unocss/core'
import extractorPug from '@unocss/extractor-pug'

export default defineConfig({
  extractors: [
    extractorPug(),
    extractorSplit,
  ],
})
```
