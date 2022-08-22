# @unocss/transformer-directives

<!-- @unocss-ignore -->

UnoCSS transformer for `@apply`、`@screen` and `theme()` directive

## Install

```bash
npm i -D @unocss/transformer-directives
```

```ts
// uno.config.js
import { defineConfig } from 'unocss'
import transformerDirective from '@unocss/transformer-directives'

export default defineConfig({
  // ...
  transformers: [
    transformerDirective(),
  ],
})
```

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

#### CSS Variable Style

To be compatible with vanilla CSS, you can use CSS Variables to replace the `@apply` directive.

```css
.custom-div {
  --at-apply: text-center my-0 font-medium;
}
```

To use rules with `:`, you will need to quote the value

```css
.custom-div {
  --at-apply: "hover:text-red";
}
```

This feature is enabled by default (with prefix `--at-`), you can configure it or disable it via:

```js
transformerDirective({
  varStyle: '--my-at-',
  // or disable with:
  // varStyle: false
})
```

### `@screen`

The `@screen` directive allows you to create media queries that reference your breakpoints by name comes from [`theme.breakpoints`](https://github.com/unocss/unocss/blob/main/README.md#extend-theme).

```css
.grid {
  @apply grid grid-cols-2;
}
@screen xs {
  .grid {
    @apply grid-cols-1;
  }
}
@screen sm {
  .grid {
    @apply grid-cols-3;
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
  @apply grid grid-cols-2;
}
@screen lt-xs {
  .grid {
    @apply grid-cols-1;
  }
}
@screen lt-sm {
  .grid {
    @apply grid-cols-3;
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
  @apply grid grid-cols-2;
}
@screen at-xs {
  .grid {
    @apply grid-cols-1;
  }
}
@screen at-xl {
  .grid {
    @apply grid-cols-3;
  }
}
@screen at-xxl {
  .grid {
    @apply grid-cols-4;
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

MIT License &copy; 2022-PRESENT [hannoeru](https://github.com/hannoeru)
