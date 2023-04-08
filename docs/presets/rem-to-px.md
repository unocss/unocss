---
title: rem to px preset
description: Converts rem to px for utils (@unocss/preset-rem-to-px).
outline: deep
---

# Rem to px preset

Converts rem to px for all utilities.

[Source Code](https://github.com/unocss/unocss/tree/main/packages/preset-rem-to-px)

## Installation

::: code-group
  ```bash [pnpm]
  pnpm add -D @unocss/preset-rem-to-px
  ```
  ```bash [yarn]
  yarn add -D @unocss/preset-rem-to-px
  ```
  ```bash [npm]
  npm install -D @unocss/preset-rem-to-px
  ```
:::

```ts
// uno.config.ts
import { defineConfig } from 'unocss'
import presetRemToPx from '@unocss/preset-rem-to-px'

export default defineConfig({
  presets: [
    presetRemToPx(),
    // ...other presets
  ],
})
```

## Usage

```html
<div class="m-2"></div>
```

::: code-group
  ```css [Without]
  .m-2 {
    margin: 0.5rem;
  }
  ```
  ```css [With]
  .m-2 {
    margin: 8px;
  }
  ```
:::

## Options

### baseFontSize
- **Type:** `number`
- **Default:** `16`

The base font size to convert rem to px (`1rem = n px`).
