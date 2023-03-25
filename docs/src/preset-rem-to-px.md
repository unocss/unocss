---
title: rem to px preset
description: Converts rem to px for utils (@unocss/preset-rem-to-px)
---

# rem to px preset

Converts rem to px for utils: `@unocss/preset-rem-to-px`.

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
import presetUno from '@unocss/preset-uno'
import presetRemToPx from '@unocss/preset-rem-to-px'

UnoCSS({
  presets: [
    presetUno(),
    presetRemToPx()
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

## License

- MIT License &copy; 2022-PRESENT [Anthony Fu](https://github.com/antfu)
