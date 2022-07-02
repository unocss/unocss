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
你可以完全自定义你的主题配置，UnoCSS 最终会深度合并用户配置和默认配置。

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

值得注意的是，断点属性除外。UnoCSS 将断点控制权交给用户，你需要完全自定义你想使用断点属性。例如：

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
现在，你只可以使用 `sm:` 和 `md:` 断点变体。

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
