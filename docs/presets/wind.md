---
title: Wind preset
description: The Tailwind / Windi CSS compact preset for UnoCSS (@unocss/preset-wind)
---

# Wind preset

The Tailwind / Windi CSS compact preset for UnoCSS: `@unocss/preset-wind`.

::: info
This preset inherits [Mini preset](/preset-mini).
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
import presetWind from '@unocss/preset-wind'

UnoCSS({
  presets: [
    presetWind(),
  ],
})
```

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

## License

- MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
