---
title: UnoCSS PostCSS Plugin
outline: deep
---

# PostCSS Plugin

PostCSS plugin for UnoCSS. Supports `@apply`、`@screen` and `theme()` directives.

[Source Code](https://github.com/unocss/unocss/tree/main/packages/postcss)

::: warning
This package is in an experimental state right now. It doesn't follow semver, and may introduce breaking changes in patch versions.
:::

## Install

```bash
npm i -D @unocss/postcss
```

```ts
// postcss.config.cjs
module.exports = {
  plugins: {
    '@unocss/postcss': {
      // Optional
      content: ['**/*.{html,js,ts,jsx,tsx,vue,svelte,astro}'],
    },
  },
}
```

```ts
// uno.config.ts
import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
  ],
})
```

```css
/* style.css */
@unocss;
```

## Usage

### `@unocss`

`@unocss` at-rule is a placeholder. It will be replaced by the generated CSS. 

You can also inject each layer individually:

```css
/* style.css */
@unocss preflights;
@unocss default;

/*
  Fallback layer. It's always recommended to include.
  Only unused layers will be injected here.
*/
@unocss; 
```

If you want to include all layers no matter whether they are previously included or not, you can use `@unocss all`. This is useful if you want to include generated CSS in multiple files.

```css
@unocss all; 
```

### `@apply`

```css
.custom-div {
  @apply text-center my-0 font-medium;
}
```

Will be transformed to:

```css
.custom-div {
  margin-top: 0rem;
  margin-bottom: 0rem;
  text-align: center;
  font-weight: 500;
}
```

### `@screen`

The `@screen` directive allows you to create media queries that reference your breakpoints by name comes from [`theme.breakpoints`](https://github.com/unocss/unocss/blob/main/README.md#extend-theme).

```css
.grid {
  --uno: grid grid-cols-2;
}
@screen xs {
  .grid {
    --uno: grid-cols-1;
  }
}
@screen sm {
  .grid {
    --uno: grid-cols-3;
  }
}
/* ... */
...
```

Will be transformed to:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
@media (min-width: 320px) {
  .grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
/* ... */
```

#### Breakpoint Variant Support
`@screen` also supports `lt`、`at` variants

##### `@screen lt`

```css
.grid {
  --uno: grid grid-cols-2;
}
@screen lt-xs {
  .grid {
    --uno: grid-cols-1;
  }
}
@screen lt-sm {
  .grid {
    --uno: grid-cols-3;
  }
}
/* ... */
```

Will be transformed to:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
@media (max-width: 319.9px) {
  .grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
@media (max-width: 639.9px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
/* ... */
```

##### `@screen at`

```css
.grid {
  --uno: grid grid-cols-2;
}
@screen at-xs {
  .grid {
    --uno: grid-cols-1;
  }
}
@screen at-xl {
  .grid {
    --uno: grid-cols-3;
  }
}
@screen at-xxl {
  .grid {
    --uno: grid-cols-4;
  }
}
/* ... */
```

Will be transformed to:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
@media (min-width: 320px) and (max-width: 639.9px) {
  .grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
@media (min-width: 1280px) and (max-width: 1535.9px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (min-width: 1536px) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
/* ... */
```

### `theme()`

Use the `theme()` function to access your theme config values using dot notation.

```css
.btn-blue {
  background-color: theme('colors.blue.500');
}
```

Will be compiled to:

```css
.btn-blue {
  background-color: #3b82f6;
}
```
