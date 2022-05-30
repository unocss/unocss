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

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
