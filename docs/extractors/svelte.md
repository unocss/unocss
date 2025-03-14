---
title: Svelte Extractor
---

# Svelte Extractor

Supports extracting classes from `class:` directive.

```svelte
<div class:text-orange-400={foo} />
```

Will be extracted as `text-orange-400` and generates:

```css
.text-orange-400 {
  color: #f6993f;
}
```

## Installation

::: code-group

```bash [pnpm]
pnpm add -D @unocss/extractor-svelte
```

```bash [yarn]
yarn add -D @unocss/extractor-svelte
```

```bash [npm]
npm install -D @unocss/extractor-svelte
```

```bash [bun]
bun add -D @unocss/extractor-svelte
```

:::

```ts [uno.config.ts]
import extractorSvelte from '@unocss/extractor-svelte'
import { defineConfig } from 'unocss'

export default defineConfig({
  extractors: [
    extractorSvelte(),
  ],
})
```
