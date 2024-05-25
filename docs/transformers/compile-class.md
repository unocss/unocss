---
title: Compile class transformer
description: Compile group of classes into one class (@unocss/transformer-compile-class)
outline: deep
---

# Compile class transformer

<!-- @unocss-ignore -->

Compile group of classes into one class. Inspired by the [compilation mode](https://windicss.org/posts/modes.html#compilation-mode) of Windi CSS and [issue #948](https://github.com/unocss/unocss/issues/948) by [@UltraCakeBakery](https://github.com/UltraCakeBakery).

## Installation

::: code-group
  ```bash [pnpm]
  pnpm add -D @unocss/transformer-compile-class
  ```
  ```bash [yarn]
  yarn add -D @unocss/transformer-compile-class
  ```
  ```bash [npm]
  npm install -D @unocss/transformer-compile-class
  ```
:::

```ts
// uno.config.ts
import { defineConfig } from 'unocss'
import transformerCompileClass from '@unocss/transformer-compile-class'

export default defineConfig({
  // ...
  transformers: [
    transformerCompileClass(),
  ],
})
```

::: tip
This preset is included in the `unocss` package, you can also import it from there:

```ts
import { transformerCompileClass } from 'unocss'
```
:::

## Usage

Add `:uno:` at the beginning of the class strings to mark them for compilation.

For example:

```html
<div class=":uno: text-center sm:text-left">
  <div class=":uno: text-sm font-bold hover:text-red"/>
</div>
```

Will be compiled to:

```html
<div class="uno-qlmcrp">
  <div class="uno-0qw2gr"/>
</div>
```

```css
.uno-qlmcrp {
  text-align: center;
}
.uno-0qw2gr {
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 700;
}
.uno-0qw2gr:hover {
  --un-text-opacity: 1;
  color: rgb(248 113 113 / var(--un-text-opacity));
}
@media (min-width: 640px) {
  .uno-qlmcrp {
    text-align: left;
  }
}
```

## Options

You can config the trigger string and prefix for compile class with the options. Refer to [the types](https://github.com/unocss/unocss/blob/main/packages/transformer-compile-class/src/index.ts#L4) for details.

## Tooling

### ESLint

There is an eslint rule for enforcing the class compile transformer across the whole project: [@unocss/enforce-class-compile](https://unocss.dev/integrations/eslint#unocss-enforce-class-compile)

**Usage:**

```json
{
  "plugins": ["@unocss"],
  "rules": {
    "@unocss/enforce-class-compile": "warn"
  }
}
```

## License

- MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
