---
title: Pug Extractor
description: Pug extractor for UnoCSS (@unocss/extractor-pug)
---

# Pug Extractor

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

```bash [bun]
bun add -D @unocss/extractor-pug
```

:::

```ts [uno.config.ts]
import extractorPug from '@unocss/extractor-pug'
import { defineConfig } from 'unocss'

export default defineConfig({
  extractors: [
    extractorPug(),
  ],
})
```
