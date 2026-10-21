---
title: Svelte Extractor
---

# Svelte Extractor

Supports extracting classes from `class:` directives and static unquoted `class` attributes in `.svelte` files.

```svelte
<div class:text-orange-400={foo} />
```

Will be extracted as `text-orange-400` and generates:

```css
.text-orange-400 {
  color: #f6993f;
}
```

Unquoted attributes support a single static class token:

```svelte
<div class=text-orange-400 />
<div class=hover:bg-red-500></div>
```

Use quotes for multiple classes or values containing whitespace, quotes, backticks, `=`, `<`, or `>`. Svelte expressions such as `class={active}` continue to use the normal extraction behavior.

Both `class=foo />` and `class=foo/>` extract `foo`, following Svelte's self-closing tag syntax. Other slashes remain part of the class token, such as `class=w-1/2`.

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
