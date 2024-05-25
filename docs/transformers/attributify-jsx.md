---
title: Attributify JSX transformer
description: Support valueless attributify in JSX/TSX (@unocss/transformer-attributify-jsx)
---

#  Attributify JSX transformer

Support [valueless attributify](/presets/attributify#valueless-attributify) in JSX/TSX: `@unocss/transformer-attributify-jsx`.

## Presentation

<!-- @unocss-ignore -->

```jsx
export function Component() {
  return (
    <div text-red text-center text-5xl animate-bounce>
      unocss
    </div>
  )
}
```

Will be transformed to:

```jsx
export function Component() {
  return (
    <div text-red="" text-center="" text-5xl="" animate-bounce="">
      unocss
    </div>
  )
}
```

::: details Without this transformer, JSX treats valueless attributes as boolean attributes.
```jsx
export function Component() {
  return (
    <div text-red={true} text-center={true} text-5xl={true} animate-bounce={true}>
      unocss
    </div>
  )
}
```
:::

## Installation

::: code-group
  ```bash [pnpm]
  pnpm add -D @unocss/transformer-attributify-jsx
  ```
  ```bash [yarn]
  yarn add -D @unocss/transformer-attributify-jsx
  ```
  ```bash [npm]
  npm install -D @unocss/transformer-attributify-jsx
  ```
:::

```ts{12}
// uno.config.ts
import { defineConfig, presetAttributify } from 'unocss'
import transformerAttributifyJsx from '@unocss/transformer-attributify-jsx'

export default defineConfig({
  // ...
  presets: [
    // ...
    presetAttributify(),
  ],
  transformers: [
    transformerAttributifyJsx(), // <--
  ],
})
```

::: tip
This preset is included in the `unocss` package, you can also import it from there:

```ts
import { transformerAttributifyJsx } from 'unocss'
```
:::

## Caveats

::: warning
The rules are almost the same as those of [Attributify preset](/presets/attributify), but there are several precautions.
:::

```html
<div translate-x-100% /> <!-- cannot end with `%` -->

<div translate-x-[100px] /> <!-- cannot contain `[` or `]` -->
```

Instead, you may want to use valued attributes instead:

```html
<div translate="x-100%" />

<div translate="x-[100px]" />
```

## Blocklist

This transformer will only transform attributes that are valid UnoCSS utilities.
You can also `blocklist` bypass some attributes from been transformed.

```js
transformerAttributifyJsx({
  blocklist: [/text-[a-zA-Z]*/, 'text-5xl']
})
```

```jsx
<div text-red text-center text-5xl animate-bounce>
  unocss
</div>
```

Will be compiled to:

```html
<div text-red text-center text-5xl animate-bounce="">
  unocss
</div>
```
