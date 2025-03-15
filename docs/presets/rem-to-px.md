---
title: rem to px preset
description: Converts rem to px for utils (@unocss/preset-rem-to-px).
outline: deep
---

# Rem to px preset

Converts rem to px for all utilities.

[Source Code](https://github.com/unocss/unocss/tree/main/packages-presets/preset-rem-to-px)

> You should avoid using `presetRemToPx` together with `presetWind4`. See [Usage with `presetWind4`](#usage-with-presetwind4) for more details.

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

```ts [uno.config.ts]
import presetRemToPx from '@unocss/preset-rem-to-px'
import { defineConfig } from 'unocss'

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

## Usage with `presetWind4`

`presetWind4` introduces a new spacing system via CSS variables, making it more flexible than previous versions. The default base value is `0.25rem`, but it can be easily change using the `theme` options in your config. Therefore, **using `presetRemToPx` together with `presetWind4` is not recommended**.

You can see different examples below:

```ts
// uno.config.ts
import { defineConfig, presetWind4 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4({
      theme: {
        spacing: {
          // Change the default base value to 1px.
          // `p-4` will be transformed into `padding: 0.25rem /* 4px */`
          DEFAULT: '0.0625rem',

          // Change the default base value to 16px.
          // `p-4` will be transformed into `padding: 4rem /* 64px */`
          // DEFAULT: '1rem',
        }
      },
    }),
  ],
})
```
