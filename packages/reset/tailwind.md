# @unocss/reset/tailwind.css

Based on [Tailwind's preflight](https://tailwindcss.com/docs/preflight), in static forms.

## Changes

### Static

This is provided as a static version of Tailwind's preflight, so it doesn't inherit any styles from the theme.

#### Border color

In Tailwind's preflight, the border color default border color is read from the theme `borderColor.DEFAULT`. To customize it in Uno's reset, we use CSS variable instead:

```css
@import '@unocss/reset/tailwind.css';

:root {
  --un-default-border-color: #e5e7eb;
}
```
