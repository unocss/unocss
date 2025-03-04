---
title: Wind3 preset
description: The Tailwind CSS / Windi CSS compact preset for UnoCSS (@unocss/preset-wind3).
outline: deep
---

# Wind3 preset

The Tailwind CSS / Windi CSS compact preset for UnoCSS.

[Source Code](https://github.com/unocss/unocss/tree/main/packages-presets/preset-wind3)

::: info
`@unocss/preset-wind` and `@unocss/preset-uno` are deprecated and renamed to `@unocss/preset-wind3`. This preset inherits from [`@unocss/preset-mini`](/presets/mini).
:::

## Installation

::: code-group

```bash [pnpm]
pnpm add -D @unocss/preset-wind3
```

```bash [yarn]
yarn add -D @unocss/preset-wind3
```

```bash [npm]
npm install -D @unocss/preset-wind3
```

```bash [bun]
bun add -D @unocss/preset-wind3
```

:::

```ts [uno.config.ts]
import presetWind3 from '@unocss/preset-wind3'
import { defineConfig } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
  ],
})
```

::: tip
This preset is included in the `unocss` package, you can also import it from there:

```ts
import { presetWind3 } from 'unocss'
```

:::

## Rules

The primary goal of this preset is to provide compatibility with [Tailwind CSS](https://tailwindcss.com/) and [Windi CSS](https://windicss.org/). It should be noted that complete compatibility may not be guaranteed. Please refer to their [documentation](https://tailwindcss.com/docs) for detailed usage.

For all rules and presets included in this preset, please refer to our <a href="/interactive/" target="_blank">interactive docs</a> or directly go to the [source code](https://github.com/unocss/unocss/tree/main/packages-presets/preset-wind).

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
presetWind3({
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

#### Opt-in media query based dark mode

To use opt-in media query based dark mode, you can use the `@dark:` variant:

```html
<div class="@dark:bg-red:10" />
```

```css
@media (prefers-color-scheme: dark) {
  .\@dark\:bg-red\:10 {
    background-color: rgb(248 113 113 / 0.1);
  }
}
```

## Differences from Tailwind CSS

### Quotes

Using quotes in the template (the files intended to be processed) is not supported due to how the extractor works. E.g. you won't be able to write `before:content-['']`. For these cases, you may prefer to introduce a new utility that you can explicitly set such as `class="before:content-empty"`.

### background-position with arbitrary values

Tailwind [allows](https://tailwindcss.com/docs/background-position#using-custom-values) one to use custom values for `background-position` using the bare syntax:

```html
<div class="bg-[center_top_1rem]"></div>
```

The Wind preset will instead interpret `center_top_1rem` as a color. Use a `position:` prefix to accomplish the same thing:

```html
<div class="bg-[position:center_top_1rem]"></div>
```

### Animates

Tailwind CSS has fewer built-in animations, we fully support its animation rules, and internally integrate [Animate.css](https://github.com/animate-css/animate.css) to provide more animation effects.

You can use the `animate-` prefix to guide IntelliSense to find the animation you need quickly.

:::tip
We don't merge conflicting animation names from Tailwind and Animate.css. If you need to use the animation name from Animate.css, please use `animate-<name>-alt`.
:::

For example

|                                                                                                                                         Tailwind CSS                                                                                                                                          |                                                                                                                                            Animate.css                                                                                                                                            |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|                                                                                                                                       `animate-bounce`                                                                                                                                        |                                                                                                                                       `animate-bounce-alt`                                                                                                                                        |
| <div w-full flex="~ items-center justify-center"><div class="animate-bounce bg-white dark:bg-slate-800 p-2 w-10 h-10 ring-1 ring-purple-900/5 dark:ring-purple-200/20 shadow-lg rounded-full flex items-center justify-center"><div text-purple size-5 i-carbon-arrow-down></div></div></div> | <div w-full flex="~ items-center justify-center"><div class="animate-bounce-alt bg-white dark:bg-slate-800 p-2 w-10 h-10 ring-1 ring-purple-900/5 dark:ring-purple-200/20 shadow-lg rounded-full flex items-center justify-center"><div text-purple size-5 i-carbon-arrow-down></div></div></div> |

If you want to customize or modify the animation effect, we provide highly customizable configuration items. You can modify the duration, delay, speed curve, etc. of the animation through the configuration item.

```ts [uno.config.ts]
export default defineConfig({
  theme: {
    animation: {
      keyframes: {
        custom: '{0%, 100% { transform: scale(0.5); } 50% { transform: scale(1); }}',
      },
      durations: {
        custom: '1s',
      },
      timingFns: {
        custom: 'cubic-bezier(0.4,0,.6,1)',
      },
      properties: {
        custom: { 'transform-origin': 'center' },
      },
      counts: {
        custom: 'infinite',
      },
    }
  }
})
```

Preview the custom animation:

<div class="animate-custom bg-white dark:bg-slate-800 p-2 w-fit ring-1 ring-purple-900/5 dark:ring-purple-200/20 shadow-lg rounded-md flex items-center justify-center">animate-custom</div>

:::tip
You can also add `category` to group animations for better management. This will make it easier for downstream tools to consume animation effects.

```ts [uno.config.ts] {9}
export default defineConfig({
  theme: {
    animation: {
      keyframes: {
        custom: '{0%, 100% { transform: scale(0.5); } 50% { transform: scale(1); }}',
      },
      // ...
      category: {
        custom: 'Zooming',
      },
    }
  }
})
```

:::

## Differences from Windi CSS

### Breakpoints

| Windi CSS | UnoCSS      |
| :-------- | :---------- |
| `<sm:p-1` | `lt-sm:p-1` |
| `@lg:p-1` | `at-lg:p-1` |
| `>xl:p-1` | `xl:p-1`    |

### Bracket syntax spaces

This preset uses `_` instead of `,` to respect space in bracket syntax.

| Windi CSS                          | UnoCSS                             |
| :--------------------------------- | :--------------------------------- |
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
    color: rgb(248 113 113 / var(--un-text-opacity));
  }
}
```

## Options

::: info
This preset options are inherited from [`@unocss/preset-mini`](/presets/mini#options).
:::

### important

- **Type:** `boolean | string`
- **Default:** `false`

The `important` option lets you control whether UnoCSS's utilities should be marked with `!important`. This can be really useful when using UnoCSS with existing CSS that has high specificity selectors.

::: warning
Using this option will apply important to all utilities generated by UnoCSS. You can use `important:` variant instead if you mean to apply it to specific utilities only.
:::

However, setting `important` to `true` can introduce some issues when incorporating third-party JS libraries that add inline styles to your elements. In those cases, UnoCSS's `!important` utilities defeat the inline styles, which can break your intended design.

To get around this, you can set important to an ID selector like `#app` instead:

```ts [uno.config.ts]
import presetWind3 from '@unocss/preset-wind'
import { defineConfig } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3({
      important: '#app',
    }),
  ],
})
```

This configuration will prefix all of your utilities with the given selector, effectively increasing their specificity without actually making them `!important`.

The utility `dark:bg-blue` will output:

```css
#app :is(.dark .dark\:bg-blue) {
  --un-bg-opacity: 1;
  background-color: rgb(96 165 250 / var(--un-bg-opacity));
}
```
