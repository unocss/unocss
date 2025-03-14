---
title: MDC Extractor
description: MDC extractor for UnoCSS (@unocss/extractor-mdc)
---

# MDC Extractor

Support extracting classes from [MDC (Markdown Components)](https://content.nuxtjs.org/guide/writing/mdc) syntax.

## Installation

::: code-group

```bash [pnpm]
pnpm add -D @unocss/extractor-mdc
```

```bash [yarn]
yarn add -D @unocss/extractor-mdc
```

```bash [npm]
npm install -D @unocss/extractor-mdc
```

```bash [bun]
bun add -D @unocss/extractor-mdc
```

:::

```ts [uno.config.ts]
import extractorMdc from '@unocss/extractor-mdc'
import { defineConfig } from 'unocss'

export default defineConfig({
  extractors: [
    extractorMdc(),
  ],
})
```

It will apply the extraction on `.md` `.mdc` and `.markdown` files, to extract inline props usage of classes. For example

```md
# Title{.text-2xl.font-bold}

Hello [World]{.text-blue-500}

![image](/image.png){.w-32.h-32}
```

The `text-2xl`, `font-bold`, `text-blue-500`, `w-32`, `h-32` classes will be extracted.
