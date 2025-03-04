---
title: Attributify preset
description: The UnoCSS preset that enables the attributify mode for other presets.
outline: deep
---

# Attributify preset

This enables the [attributify mode](#attributify-mode) for other presets.

[Source Code](https://github.com/unocss/unocss/tree/main/packages-presets/preset-attributify)

## Installation

::: code-group

```bash [pnpm]
pnpm add -D @unocss/preset-attributify
```

```bash [yarn]
yarn add -D @unocss/preset-attributify
```

```bash [npm]
npm install -D @unocss/preset-attributify
```

```bash [bun]
bun add -D @unocss/preset-attributify
```

:::

```ts [uno.config.ts]
import presetAttributify from '@unocss/preset-attributify'

export default defineConfig({
  presets: [
    presetAttributify({ /* preset options */ }),
    // ...
  ],
})
```

::: tip
This preset is included in the `unocss` package, you can also import it from there:

```ts
import { presetAttributify } from 'unocss'
```

:::

## Attributify Mode

Imagine you have this button using Tailwind CSS's utilities. When the list gets longer, it becomes really hard to read and maintain.

```html
<button
  class="bg-blue-400 hover:bg-blue-500 text-sm text-white font-mono font-light py-2 px-4 rounded border-2 border-blue-200 dark:bg-blue-500 dark:hover:bg-blue-600"
>
  Button
</button>
```

With attributify mode, you can separate utilities into attributes:

```html
<button
  bg="blue-400 hover:blue-500 dark:blue-500 dark:hover:blue-600"
  text="sm white"
  font="mono light"
  p="y-2 x-4"
  border="2 rounded blue-200"
>
  Button
</button>
```

For example, `text-sm text-white` could be grouped into `text="sm white"` without duplicating the same prefix.

## Prefix self-referencing

For utilities like `flex`, `grid`, `border`, that have the utilities same as the prefix, a special `~` value is provided.

For example:

```html
<button class="border border-red">Button</button>
```

Can be written as:

```html
<button border="~ red">Button</button>
```

## Valueless attributify

In addition to Windi CSS's attributify mode, this preset also supports valueless attributes.

For example,

```html
<div class="m-2 rounded text-teal-400" />
```

now can be

```html
<div m-2 rounded text-teal-400 />
```

::: info
Note: If you are using JSX, `<div foo>` might be transformed to `<div foo={true}>` which will make the generated CSS from UnoCSS fail to match the attributes. To solve this, you might want to try [`transformer-attributify-jsx`](/transformers/attributify-jsx) along with this preset.
:::

## Properties conflicts

If the name of the attributes mode ever conflicts with the elements' or components' properties, you can add `un-` prefix to be specific to UnoCSS's attributify mode.

For example:

```html
<a text="red">This conflicts with links' `text` prop</a>
<!-- to -->
<a un-text="red">Text color to red</a>
```

Prefix is optional by default, if you want to enforce the usage of prefix, set

```ts
presetAttributify({
  prefix: 'un-',
  prefixedOnly: true, // <--
})
```

You can also disable the scanning for certain attributes by:

```ts
presetAttributify({
  ignoreAttributes: [
    'text'
    // ...
  ]
})
```

## TypeScript support (JSX/TSX)

Create `shims.d.ts` with the following content:

> By default, the type includes common attributes from `@unocss/preset-uno`. If you need custom attributes, refer to the [type source](https://github.com/unocss/unocss/blob/main/packages-presets/preset-attributify/src/jsx.ts) to implement your own type.

### Vue

Since Volar 0.36, [it's now strict to unknown attributes](https://github.com/johnsoncodehk/volar/issues/1077#issuecomment-1145361472). To opt-out, you can add the following file to your project:

```ts [html.d.ts]
declare module '@vue/runtime-dom' {
  interface HTMLAttributes {
    [key: string]: any
  }
}
declare module '@vue/runtime-core' {
  interface AllowedComponentProps {
    [key: string]: any
  }
}
export {}
```

### React

```ts
import type { AttributifyAttributes } from '@unocss/preset-attributify'

declare module 'react' {
  interface HTMLAttributes<T> extends AttributifyAttributes {}
}
```

### Vue 3

```ts
import type { AttributifyAttributes } from '@unocss/preset-attributify'

declare module '@vue/runtime-dom' {
  interface HTMLAttributes extends AttributifyAttributes {}
}
```

### SolidJS

```ts
import type { AttributifyAttributes } from '@unocss/preset-attributify'

declare module 'solid-js' {
  namespace JSX {
    interface HTMLAttributes<T> extends AttributifyAttributes {}
  }
}
```

### Svelte & SvelteKit

```ts
declare namespace svelteHTML {
  import type { AttributifyAttributes } from '@unocss/preset-attributify'

  type HTMLAttributes = AttributifyAttributes
}
```

### Astro

```ts
import type { AttributifyAttributes } from '@unocss/preset-attributify'

declare global {
  namespace astroHTML.JSX {
    interface HTMLAttributes extends AttributifyAttributes { }
  }
}
```

### Preact

```ts
import type { AttributifyAttributes } from '@unocss/preset-attributify'

declare module 'preact' {
  namespace JSX {
    interface HTMLAttributes extends AttributifyAttributes {}
  }
}
```

### Attributify with Prefix

```ts
import type { AttributifyNames } from '@unocss/preset-attributify'

type Prefix = 'uno:' // change it to your prefix

interface HTMLAttributes extends Partial<Record<AttributifyNames<Prefix>, string>> {}
```

## Options

### strict

- **type:** `boolean`
- **default:** `false`

Only generate CSS for attributify or class.

### prefix

- **type:** `string`
- **default:** `'un-'`

The prefix for attributify mode.

### prefixedOnly

- **type:** `boolean`
- **default:** `false`

Only match for prefixed attributes.

### nonValuedAttribute

- **type:** `boolean`
- **default:** `true`

Support matching non-valued attributes.

### ignoreAttributes

- **type:** `string[]`

A list of attributes to be ignored from extracting.

### trueToNonValued

- **type:** `boolean`
- **default:** `false`

Non-valued attributes will also match if the actual value represented in DOM is `true`. This option exists for supporting frameworks that encodes non-valued attributes as `true`. Enabling this option will break rules that ends with `true`.

## Credits

Initial idea by [@Tahul](https://github.com/Tahul) and [@antfu](https://github.com/antfu). Prior [implementation in Windi CSS](https://windicss.org/posts/v30.html#attributify-mode) by [@voorjaar](https://github.com/voorjaar).
