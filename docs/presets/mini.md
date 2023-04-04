---
title: Mini preset
description: The minimal preset for UnoCSS (@unocss/preset-mini)
outline: deep
---

# Mini preset

The basic preset for UnoCSS, with only the most essential utilities.

[Source Code](https://github.com/unocss/unocss/tree/main/packages/preset-mini)

## Installation

::: code-group
  ```bash [pnpm]
  pnpm add -D @unocss/preset-mini
  ```
  ```bash [yarn]
  yarn add -D @unocss/preset-mini
  ```
  ```bash [npm]
  npm install -D @unocss/preset-mini
  ```
:::

```ts
// uno.config.ts
import { defineConfig } from 'unocss'
import presetMini from '@unocss/preset-mini'

export default defineConfig({
  presets: [
    presetMini(),
    // ...other presets
  ],
})
```

::: tip
This preset is included in the `unocss` package, you can also import it from there:

```ts
import { presetMini } from 'unocss'
```
:::

## Rules

This presets is is a subset of [`@unocss/preset-wind`](/presets/wind), containing only the most essential utilities that aligned with CSS's properties, but excluded opinioned or complicated utilities introduced in Tailwind (`container`, `animation`, `gradient` etc.). This can be a good starting point for your own custom preset on top of familiar utilities from Tailwind CSS or Windi CSS.

## Features

### Dark mode

By default, this preset generates class-based dark mode with `dark:` variant.

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
You can fully customize your theme property in your config, and UnoCSS will eventually deeply merge it to the default theme.

<!--eslint-skip-->

```ts
presetMini({
  theme: {
    // ...
    colors: {
      'veryCool': '#0000ff', // class="text-very-cool"
      'brand': {
        'primary': 'hsla(var(--hue, 217), 78%, 51%)', //class="bg-brand-primary"
      }
    },
  }
})
```

To consume the theme in rules:

```ts
rules: [
  [/^text-(.*)$/, ([, c], { theme }) => {
    if (theme.colors[c])
      return { color: theme.colors[c] }
  }],
]
```

::: warning
One exception is that UnoCSS gives full control of `breakpoints` to users. When a custom `breakpoints` is provided, the default will be overridden instead of merging.
:::

With the following example, you will be able to only use the `sm:` and `md:` breakpoint variants:

```ts
presetMini({
  theme: {
    // ...
    breakpoints: {
      sm: '320px',
      md: '640px',
    },
  },
})
```

::: info
`verticalBreakpoints` is same as `breakpoints` but for vertical layout.
:::
