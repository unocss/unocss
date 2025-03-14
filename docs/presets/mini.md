---
title: Mini preset
description: The minimal preset for UnoCSS (@unocss/preset-mini).
outline: deep
---

# Mini preset

The basic preset for UnoCSS, with only the most essential utilities.

[Source Code](https://github.com/unocss/unocss/tree/main/packages-presets/preset-mini)

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

```bash [bun]
bun add -D @unocss/preset-mini
```

:::

```ts [uno.config.ts]
import presetMini from '@unocss/preset-mini'
import { defineConfig } from 'unocss'

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

This preset is a subset of [`@unocss/preset-wind3`](/presets/wind3), containing only the most essential utilities aligned with CSS's properties, but excludes opinioned or complicated utilities introduced in Tailwind CSS (`container`, `animation`, `gradient` etc.). This can be a good starting point for your own custom preset on top of familiar utilities from Tailwind CSS or Windi CSS.

## Features

### Dark mode

By default, this preset generates class-based dark mode with `dark:` variant.

```html
<div class="dark:bg-red:10" />
```

will generate:

```css
.dark .dark\:bg-red\:10 {
  background-color: rgb(248 113 113 / 0.1);
}
```

#### Media query based dark mode

To instead use media query based dark mode globally you can change the config for the `dark:` variant:

```ts
presetMini({
  dark: 'media'
})
```

Now

```html
<div class="dark:bg-red:10" />
```

will generate:

```css
@media (prefers-color-scheme: dark) {
  .dark\:bg-red\:10 {
    background-color: rgb(248 113 113 / 0.1);
  }
}
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

:::warning
`breakpoints` property isn't deeply merged, but overridden, see [Breakpoints](/config/theme#breakpoints).
:::

```ts
presetMini({
  theme: {
    // ...
    colors: {
      veryCool: '#0000ff', // class="text-very-cool"
      brand: {
        primary: 'hsl(var(--hue, 217) 78% 51%)', // class="bg-brand-primary"
      }
    },
  }
})
```

## Options

### dark

- **Type:** `class | media | DarkModeSelectors`
- **Default:** `class`

The dark mode options. It can be either `class`, `media`, or a custom selector object(`DarkModeSelectors`).

```ts
interface DarkModeSelectors {
  /**
   * Selector for light variant.
   *
   * @default '.light'
   */
  light?: string

  /**
   * Selector for dark variant.
   *
   * @default '.dark'
   */
  dark?: string
}
```

### attributifyPseudo

- **Type:** `Boolean`
- **Default:** `false`

Generate pseudo selector as `[group=""]` instead of `.group`.

### variablePrefix

- **Type:** `string`
- **Default:** `un-`

Prefix for CSS custom properties.

### prefix

- **Type:** `string | string[]`
- **Default:** `undefined`

Utils prefix.

### preflight

- **Type:** `boolean` | `on-demand`
- **Default:** `true`

Generate preflight css. It can be:

- `true`: always generate preflight.
- `false`: no preflight.
- `on-demand`: only generate preflight for used utilities.
