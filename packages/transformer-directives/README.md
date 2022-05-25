# @unocss/transformer-directives

<!-- @unocss-ignore -->

UnoCSS transformer for `@apply` and `theme()` directive

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

> Currently only `@apply` is supported.

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

This feature is enabled by default (with prefix `--at-`), can you configure it or disable it via:

```js
transformerDirective({
  varStyle: '--my-at-',
  // or disable with:
  // varStyle: false
})
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
