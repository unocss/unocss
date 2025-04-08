---
title: Wind4 preset
description: The Tailwind4 CSS compact preset for UnoCSS (@unocss/preset-wind4).
outline: deep
---

# Wind4 preset

The Tailwind4 CSS compact preset for UnoCSS. It's compatible with all features of PresetWind3 and enhances it further.

[Source Code](https://github.com/unocss/unocss/tree/main/packages-presets/preset-wind4)

::: tip

You can spend a little time reading this document to understand the changes

:::

## Installation

::: code-group

```bash [pnpm]
pnpm add -D @unocss/preset-wind4
```

```bash [yarn]
yarn add -D @unocss/preset-wind4
```

```bash [npm]
npm install -D @unocss/preset-wind4
```

```bash [bun]
bun add -D @unocss/preset-wind4
```

:::

```ts twoslash [uno.config.ts]
import presetWind4 from '@unocss/preset-wind4'
import { defineConfig } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4(),
    //  ^?
  ],
})
```

## Compatibility

Refer to [Tailwind Compatibility](https://tailwindcss.com/docs/compatibility) to learn about browser support and compatibility.

## Theme

`PresetWind4`'s theme is almost identical to `PresetWind3`'s theme, but some theme keys have been adjusted.

:::warning
Please note when switching to PresetWind4, refer to the table below to check your theme key configuration and make appropriate adjustments.
:::

|                                            PresetWind3                                            |                          PresetWind4                          |
| :-----------------------------------------------------------------------------------------------: | :-----------------------------------------------------------: |
|                                           `fontFamily`                                            |                            `font`                             |
|                                            `fontSize`                                             |            Moved to `fontSize` property in `text`             |
|                                           `lineHeight`                                            |   Moved to `lineHeight` property in `text` or use `leading`   |
|                                          `letterSpacing`                                          | Moved to `letterSpacing` property in `text` or use `tracking` |
|                                          `borderRadius`                                           |                           `radius`                            |
|                                             `easing`                                              |                            `ease`                             |
|                                           `breakpoints`                                           |                         `breakpoint`                          |
|                                       `verticalBreakpoints`                                       |                     `verticalBreakpoint`                      |
|                                            `boxShadow`                                            |                           `shadow`                            |
|                                                 -                                                 |                         `insetShadow`                         |
|     Size properties like `width`, `height`, `maxWidth`, `maxHeight`, `minWidth`, `minHeight`      |                   Unified to use `spacing`                    |
|                                       `transitionProperty`                                        |                          `property`                           |
| `gridAutoColumn`, `gridAutoRow`, `gridColumn`, `gridRow`, `gridTemplateColumn`, `gridTemplateRow` |                               -                               |
|                                       `container.maxWidth`                                        |                     `containers.maxWidth`                     |
|                                                 -                                                 |                          `defaults`                           |

### `Theme.defaults`

`Theme.defaults` is a global default theme configuration that will be applied to `reset` styles or used as default values for certain rules.

Below are the default values for `Theme.defaults`, which you can override in your theme configuration.

<details>
<summary>Click to view default values</summary>

```ts twoslash [uno.config.ts]
import type { Theme } from '@unocss/preset-wind4/theme'

export const defaults: Theme['defaults'] = {
  transition: {
    duration: '150ms',
    timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  font: {
    family: 'var(--font-sans)',
    featureSettings: 'var(--font-sans--font-feature-settings)',
    variationSettings: 'var(--font-sans--font-variation-settings)',
  },
  monoFont: {
    family: 'var(--font-mono)',
    featureSettings: 'var(--font-mono--font-feature-settings)',
    variationSettings: 'var(--font-mono--font-variation-settings)',
  },
}
```

</details>

## Options

PresetWind4's basic configuration is similar to [PresetWind3](/presets/wind3#options), with the following important changes.

### Reset Styles

In PresetWind4, we align the reset styles with tailwind4 and integrate them internally. You don't need to install any additional CSS reset package like `@unocss/reset` or `normalize.css`.

```ts [main.ts]
import '@unocss/reset/tailwind.css' // [!code --]
import '@unocss/reset/tailwind-compact.css' // [!code --]
```

You only need to control whether to enable reset styles through a switch:

```ts twoslash [uno.config.ts]
import presetWind4 from '@unocss/preset-wind4'
import { defineConfig } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4({
      reset: true, // [!code focus]
      // ^?
    }),
  ],
})
```

### Utility Resolver

In PresetWind4, we've upgraded the `postProcess` hook to provide a more concise API. You can now directly customize `utilities` in the preset.

For example, if you want to use the `presetRemToPx` preset to convert `rem` to `px`, you no longer need to import this preset separately as `presetWind4` provides this functionality internally.

```ts twoslash [uno.config.ts]
import { createRemToPxResolver } from '@unocss/preset-wind4/utils' // [!code focus]
import { defineConfig, presetWind4 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4({
      utilityResolver: createRemToPxResolver() // [!code focus]
    }),
  ],
})
```

You can customize more resolver sets to process `utilities` and output the CSS you want.

For specific implementation methods, please refer to `postProcess` or the [presetWind4 test case](https://github.com/unocss/unocss/blob/60c15bb78d96704a4532e2bf502efa16125fdceb/test/preset-wind4.test.ts#L178-L232)

### Theme Preflight

Choose how to generate theme CSS variables.

The UnoCSS engine with `presetWind4` installed will automatically collect dependencies on the theme when parsing utilities and generate CSS variables at the end.

- `true`: Generate theme keys fully.
- `false`: Disable theme keys. (Not recommended ⚠️)
- `'on-demand'`: Generate theme keys only when used. -> ✅ **(By default)**

## Generated CSS

In the output of PresetWind4, two new layers have been added: `theme` and `cssvar-property`.

|    Layer Name     |              Description              | order |
| :---------------: | :-----------------------------------: | :---: |
| `cssvar-property` | CSS properties defined by `@property` | -200  |
|      `theme`      |      Theme-related CSS variables      | -150  |

### `cssvar-property` Layer

We have used `@property` to define CSS properties in many rules to achieve better performance and smaller size.

For example, commonly used utilities like `text-op-xx`, `bg-op-xx`, and so on.

```css
@property --un-text-opacity {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 100%;
}
```

### `theme` Layer

We've placed theme-related CSS variables in the `theme` layer to make it easier for you to override and use directly.
It can be comprehensive or on-demand. It always comes from your theme configuration.

```css
:root,
:host {
  --spacing: 0.25rem;
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  --font-serif: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --colors-black: #000;
  --colors-white: #fff;
  /* ... */
}
```

## Compatibility with Other Presets

`PresetWind4` enhances and is compatible with `PresetWind3`. Since other packages were originally developed for `PresetWind3`, some issues may arise when using them together. Known issues include:

### presetWebFonts

When using `presetWebFonts` with `PresetWind4`, the `fontFamily` theme key is no longer supported.
Please make the following adjustment:

```ts twoslash [uno.config.ts]
import { defineConfig, presetWebFonts, presetWind4 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4(),
    presetWebFonts({
      themeKey: 'font', // [!code ++]
      // ^?
    }),
  ],
})
```

### transformDirectives

`transformDirectives` doesn't work well with `PresetWind4`. There are some known issues, so please use it with caution.

:::warning

- When using `@apply` to process rules that have `@property`, conflicts may occur between different layer levels.
  :::
