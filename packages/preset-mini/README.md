# @unocss/preset-mini

The minimal preset for [UnoCSS](https://github.com/unocss/unocss).

## Installation

```bash
npm i -D @unocss/preset-mini
```

```ts
import presetMini from '@unocss/preset-mini'

Unocss({
  presets: [
    presetMini(),
  ],
})
```

## Features

### Dark Mode

By default, this preset generates class based dark mode with `dark:` variant.

```html
<div class="dark:bg-red:10" />
```

will generate:

```css
.dark .dark\:bg-red\:10 {
  background-color: rgba(248, 113, 113, 0.1);
}
```

To opt-in media query based dark mode, you can use `@dark:` variant:

```html
<div class="@dark:bg-red:10" />
```

```css
@media (prefers-color-scheme: dark) {
  .\@dark\:bg-red\:10 {
    background-color: rgba(248, 113, 113, 0.1);
  }
}
```

Or set globally with the config for `dark:` variant

```ts
presetMini({
  dark: 'media'
})
```

### CSS @layer

[CSS's native @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer) is supported with variant `layer-xx:`

```html
<div class="layer-foo:p4" />
<div class="layer-bar:m4" />
```

will generate:

```css
@layer foo {
  .layer-foo\:p4 {
    padding: 1rem;
  }
}
@layer bar {
  .layer-bar\:m4 {
    margin: 1rem;
  }
}
```

### Theme
You can fully customize your theme configuration, and UnoCSS will eventually deeply merge user configuration and default configuration.

```ts
presetMini({
  theme: {
    // ...
    colors: {
      primary: '#ff0000',
    },
  },
})
```

One exception is that UnoCSS gives full control of `breakpoints` to users. When a custom `breakpoints` is provided, the default will be overridden instead of merging. For example:

```ts
presetMini({
  theme: {
    // ...
    breakpoints: {
      sm: '320px',
      md: '768px',
    },
  },
})
```

Right now, you can only use the `sm:` and `md:` breakpoint variants.

`verticalBreakpoints` is same as `breakpoints` but for vertical layout.

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
