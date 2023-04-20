---
title: Theme
description: UnoCSS also supports the theming system that you might be familiar with in Tailwind / Windi.
---

# Theme

UnoCSS also supports the theming system that you might be familiar with in Tailwind / Windi. At the user level, you can specify the `theme` property in your config, and it will be deep merged to the default theme.

## Usage

<!--eslint-skip-->

```ts
theme: {
  // ...
  colors: {
    'veryCool': '#0000ff', // class="text-very-cool"
    'brand': {
      'primary': 'hsla(var(--hue, 217), 78%, 51%)', //class="bg-brand-primary"
    }
  },
}
```

## Usage in `rules`

To consume the theme in rules:

```ts
rules: [
  [/^text-(.*)$/, ([, c], { theme }) => {
    if (theme.colors[c])
      return { color: theme.colors[c] }
  }],
]
```

One exception is that UnoCSS gives full control of `breakpoints` to users. When a custom `breakpoints` is provided, the default will be overridden instead of merging. For example:

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

Right now, you can only use the `sm:` and `md:` breakpoint variants.

`verticalBreakpoints` is same as `breakpoints` but for vertical layout.
