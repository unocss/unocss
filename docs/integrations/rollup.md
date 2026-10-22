---
title: UnoCSS Rollup and Rolldown Plugin
description: Use UnoCSS with Rollup or Rolldown.
outline: deep
---

# Rollup and Rolldown Plugin

Use UnoCSS with Rollup or Rolldown without Vite. The plugin supports the `global` mode and emits a CSS asset when you import `uno.css` from an entry module.

## Installation

::: code-group

```bash [pnpm]
pnpm add -D unocss rollup
```

```bash [yarn]
yarn add -D unocss rollup
```

```bash [npm]
npm install -D unocss rollup
```

```bash [bun]
bun add -D unocss rollup
```

:::

Replace `rollup` with `rolldown` when you use Rolldown.

## Rollup

```ts [rollup.config.ts]
import UnoCSS from 'unocss/rollup'

export default {
  input: 'src/main.ts',
  plugins: [
    UnoCSS(),
  ],
}
```

## Rolldown

```ts [rolldown.config.ts]
import UnoCSS from 'unocss/rolldown'

export default {
  input: 'src/main.ts',
  plugins: [
    UnoCSS(),
  ],
}
```

Import `uno.css` from an entry module:

```ts [src/main.ts]
import 'uno.css'
```

The plugin emits generated CSS as an output asset. Include that asset in your application with your deployment or HTML pipeline.

## Configuration

Create a `uno.config.ts` file:

```ts [uno.config.ts]
import { defineConfig } from 'unocss'

export default defineConfig({
  // ...UnoCSS options
})
```

You can also pass the configuration to the plugin directly:

```ts
import UnoCSS from 'unocss/rollup'

UnoCSS({
  // ...UnoCSS options
})
```
