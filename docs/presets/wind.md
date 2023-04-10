---
title: Wind preset
description: The Tailwind / Windi CSS compact preset for UnoCSS (@unocss/preset-wind).
outline: deep
---

# Wind preset

The Tailwind / Windi CSS compact preset for UnoCSS.

[Source Code](https://github.com/unocss/unocss/tree/main/packages/preset-wind)

::: info
This preset inherits [`@unocss/preset-mini`](/presets/mini).
:::

## Installation

::: code-group
  ```bash [pnpm]
  pnpm add -D @unocss/preset-wind
  ```
  ```bash [yarn]
  yarn add -D @unocss/preset-wind
  ```
  ```bash [npm]
  npm install -D @unocss/preset-wind
  ```
:::

```ts
// uno.config.ts
import { defineConfig } from 'unocss'
import presetWind from '@unocss/preset-wind'

export default defineConfig({
  presets: [
    presetWind(),
  ],
})
```

::: tip
This preset is included in the `unocss` package, you can also import it from there:

```ts
import { presetWind } from 'unocss'
```
:::

## Rules
This preset is compatible with [Tailwind CSS](https://tailwindcss.com/) and [Windi CSS](https://windicss.org/), you can refer to their [documentation](https://tailwindcss.com/docs) for detailed usage.

For all rules and presets included in this preset, please refer to our [interactive docs](/interactive/) or directly go to the [source code](https://github.com/unocss/unocss/tree/main/packages/preset-wind).

## Differences from Windi CSS

### Breakpoints

| Windi CSS | UnoCSS |
|:--|:--|
| `<sm:p-1` | `lt-sm:p-1` |
| `@lg:p-1` | `at-lg:p-1` |
| `>xl:p-1` | `lg:p-1`    |

### Bracket syntax spaces

This preset uses `_` instead of `,` to respect space in bracket syntax.

| Windi CSS | UnoCSs |
|:--|:--|
| `grid-cols-[1fr,10px,max-content]` | `grid-cols-[1fr_10px_max-content]` |

Since some CSS rules require `,` as parts of the value, e.g. `grid-cols-[repeat(3,auto)]`

## Experimental Features

::: warning
This preset includes experimental features that may be changed in breaking ways at any time.
:::

### Media Hover

Media hover addresses the [sticky hover](https://css-tricks.com/solving-sticky-hover-states-with-media-hover-hover/) problem where tapping target that includes hover style on mobile will persist that hover style until tapping elsewhere.

Since the regular `:hover` style most probably used so widely, the variant uses `@hover` syntax to distinguish it from the regular `hover` pseudo.

The variant `@hover-text-red` will output:

```css
@media (hover: hover) and (pointer: fine) {
  .\@hover-text-red:hover {
    --un-text-opacity: 1;
    color: rgba(248, 113, 113, var(--un-text-opacity));
  }
}
```

## Options

::: info
This preset options are inherited from [`@unocss/preset-mini`](/presets/mini#options).
:::
