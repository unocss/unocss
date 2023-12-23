---
title: Style Reset
description: UnoCSS does not provide style resetting or preflight by default for maximum flexibility and does not populate your global CSS.
outline: deep
---

# Browser Style Reset

UnoCSS does not provide style resetting or preflight by default so not to populate your global CSS and also for maximum flexibility. If you use UnoCSS along with other CSS frameworks, they probably already do the resetting for you. If you use UnoCSS alone, you can use resetting libraries like [Normalize.css](https://github.com/csstools/normalize.css).

We also provide a small collection for you to grab them quickly:

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

### Normalize.css

Source: https://github.com/csstools/normalize.css

```ts
import '@unocss/reset/normalize.css'
```

### sanitize.css

Source: https://github.com/csstools/sanitize.css

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

This reset is based on [Tailwind reset](#tailwind), minus the background color override for buttons to avoid conflicts with UI frameworks. See [linked issue](https://github.com/unocss/unocss/issues/2127).

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
