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
import extractorPug from '@unocss/extractor-pug'
import { extractorSplit } from '@unocss/core'

UnoCSS({
  extractors: [
    extractorPug(),
    extractorSplit,
  ],
})
```

## License

- MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)