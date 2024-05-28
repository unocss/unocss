---
title: Directives transformer
description: UnoCSS transformer for @apply, @screen and theme() directives (@unocss/transformer-directives)
outline: deep
---

# Directives transformer

UnoCSS transformer for `@apply`, `@screen` and `theme()` directives: `@unocss/transformer-directives`.

## Installation

::: code-group
  ```bash [pnpm]
  pnpm add -D @unocss/transformer-directives
  ```
  ```bash [yarn]
  yarn add -D @unocss/transformer-directives
  ```
  ```bash [npm]
  npm install -D @unocss/transformer-directives
  ```
:::

```ts
// uno.config.ts
import { defineConfig } from 'unocss'
import transformerDirectives from '@unocss/transformer-directives'

export default defineConfig({
  // ...
  transformers: [
    transformerDirectives(),
  ],
})
```

::: tip
This preset is included in the `unocss` package, you can also import it from there:

```ts
import { transformerDirectives } from 'unocss'
```
:::

## Usage

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

#### `--at-apply`

To be compatible with vanilla CSS, you can use CSS custom properties to replace the `@apply` directive:

```css
.custom-div {
  --at-apply: text-center my-0 font-medium;
}
```

This feature is enabled by default with a few aliases, that you can configure or disable via:

```js
transformerDirectives({
  // the defaults
  applyVariable: ['--at-apply', '--uno-apply', '--uno'],
  // or disable with:
  // applyVariable: false
})
```

#### Adding quotes

To use rules with `:`, you will have to quote the whole value:

```css
.custom-div {
  --at-apply: "hover:text-red hover:font-bold";
  /* or */
  @apply 'hover:text-red hover:font-bold';
}
```

Using quotes after `@apply` is optional, to meet the behavior of some formatters.

### `@screen`

The `@screen` directive that allows you to create media queries that reference your breakpoints by name comes from [`theme.breakpoints`](/config/theme).

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

#### Breakpoint variant support

`@screen` also supports `lt`、`at` variants:

#### `@screen lt-`

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

#### `@screen at-`

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

## License

- MIT License &copy; 2022-PRESENT [hannoeru](https://github.com/hannoeru)
