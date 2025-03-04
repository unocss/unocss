---
title: Wind4 preset
description: The Tailwind4 CSS compact preset for UnoCSS (@unocss/preset-wind4).
outline: deep
---

# Wind4 preset

The Tailwind4 CSS compact preset for UnoCSS.

[Source Code](https://github.com/unocss/unocss/tree/main/packages-presets/preset-wind4)

## Installation

::: code-group

```bash [pnpm]
pnpm add -D @unocss/preset-wind4
```

```bash [yarn]
yarn add -D @unocss/preset-wind4
```

```bash [npm]
npm install -D @unocss/preset-wind4
```

```bash [bun]
bun add -D @unocss/preset-wind4
```

:::

```ts [uno.config.ts]
import presetWind4 from '@unocss/preset-wind4'
import { defineConfig } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4(),
  ],
})
```

TODO: Add more details here.
