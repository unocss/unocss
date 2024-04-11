---
title: Theme
description: UnoCSS also supports the theming system that you might be familiar with in Tailwind CSS / Windi CSS.
outline: deep
---

# Theme

UnoCSS also supports the theming system that you might be familiar with in Tailwind CSS / Windi CSS. At the user level, you can specify the `theme` property in your config, and it will be deep-merged to the default theme.

## Usage

<!--eslint-skip-->

```ts
theme: {
  // ...
  colors: {
    'veryCool': '#0000ff', // class="text-very-cool"
    'brand': {
      'primary': 'hsl(var(--hue, 217) 78% 51%)', //class="bg-brand-primary"
    },
  },
}
```
::: tip
During the parsing process, `theme` will always exist in `context`.
:::

### Usage in `rules`

To consume the theme in rules:

```ts
rules: [
  [/^text-(.*)$/, ([, c], { theme }) => {
    if (theme.colors[c])
      return { color: theme.colors[c] }
  }],
]
```

### Usage in `variants`

To consume the theme in variants:

```ts
variants: [
  {
    name: 'variant-name',
    match(matcher, { theme }) {
      // ...
    },
  },
]
```

### Usage in `shortcuts`

To consume the theme in dynamic shortcuts:

```ts
shortcuts: [
  [/^badge-(.*)$/, ([, c], { theme }) => {
    if (Object.keys(theme.colors).includes(c))
      return `bg-${c}4:10 text-${c}5 rounded`
  }],
]
```

## Breakpoints

::: warning
When a custom `breakpoints` object is provided the default will be overridden instead of merging.
:::

With the following example, you will be able to only use the `sm:` and `md:` breakpoint variants:

<!--eslint-skip-->

```ts
theme: {
  // ...
  breakpoints: {
    sm: '320px',
    md: '640px',
  },
}
```

::: info
`verticalBreakpoints` is same as `breakpoints` but for vertical layout.
:::

In addition we will sort screen points by size (same unit). For screen points in different units, in order to avoid errors, please use unified units in the configuration.

<!--eslint-skip-->

```ts
theme: {
  // ...
  breakpoints: {
    sm: '320px',
    // Because uno does not support comparison sorting of different unit sizes, please convert to the same unit.
    // md: '40rem',
    md: `${40 * 16}px`,
    lg: '960px',
  },
}
```
