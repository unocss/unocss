---
title: Reset
description: Collection of standard reset CSS stylesheets (@unocss/reset).
---

# Reset

Collection of standard reset CSS stylesheets: `@unocss/reset`.

## Installation

::: code-group
  ```bash [pnpm]
  pnpm add @unocss/reset
  ```
  ```bash [yarn]
  yarn add @unocss/reset
  ```
  ```bash [npm]
  npm install @unocss/reset
  ```
:::

## Usage

You can add one of the following reset stylesheets to your `main.js`.

### normalize.css

Source: https://necolas.github.io/normalize.css/

```ts
import '@unocss/reset/normalize.css'
```

### sanitize.css

Source: https://github.com/csstools/sanitize.css#usage

```ts
import '@unocss/reset/sanitize/sanitize.css'
import '@unocss/reset/sanitize/assets.css'
```

### Eric Meyer

Source: https://meyerweb.com/eric/tools/css/reset/index.html

```ts
import '@unocss/reset/eric-meyer.css'
```

### Tailwind

```ts
import '@unocss/reset/tailwind.css'
```

### Tailwind compat

```ts
import '@unocss/reset/tailwind-compat.css'
```

This reset is based on [Tailwind reset](#tailwind), minus the background color override for buttons to avoid conflicts with UI frameworks. See [linked issue #2127](https://github.com/unocss/unocss/issues/2127).

::: code-group
  ```css [Before]
  button,
  [type='button'],
  [type='reset'],
  [type='submit'] {
    -webkit-appearance: button; /* 1 */
    background-color: transparent; /* 2 */
    background-image: none; /* 2 */
  }
  ```
  ```css [After]
  button,
  [type='button'],
  [type='reset'],
  [type='submit'] {
    -webkit-appearance: button; /* 1 */
    /*background-color: transparent; !* 2 *!*/
    background-image: none; /* 2 */
  }
  ```
:::

### Anthony Fu

::: warning
This opinionated reset is experimental and at the current stage, beware that changes will NOT follow semver.
:::

```ts
import '@unocss/reset/antfu.css'
```

This reset is based on [Tailwind reset](#tailwind) with a few opinionated additions:

```css
html {
  scrollbar-gutter: stable;
}
.dark {
  color-scheme: dark;
}
.dark ::-moz-selection  {
  background: #444;
}
.dark ::selection {
  background: #444;
}
```

And some default CSS behavior changes:

- `<div>` is now **default to `display: flex`** and `flex-direction: column`
- `<div row>` for `flex-direction: row`
- `<div block>` original `display: block`
