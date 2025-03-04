---
title: Legacy Compat preset
description: Collections of legacy compatibility utilities.
outline: deep
---

# Legacy Compat Preset

Collections of legacy compatibility utilities.

This preset does not include any rules, it's applying postprocess to the generated CSS from other presets.

By default none of the options are enabled, you need to opt-in each of them explicitly.

[Source Code](https://github.com/unocss/unocss/tree/main/packages-presets/preset-legacy-compat)

## Installation

::: code-group

```bash [pnpm]
pnpm add -D @unocss/preset-legacy-compat
```

```bash [yarn]
yarn add -D @unocss/preset-legacy-compat
```

```bash [npm]
npm install -D @unocss/preset-legacy-compat
```

```bash [bun]
bun add -D @unocss/preset-legacy-compat
```

:::

```ts [uno.config.ts]
import presetLegacyCompat from '@unocss/preset-legacy-compat'
import { defineConfig } from 'unocss'

export default defineConfig({
  presets: [
    // ...other presets
    presetLegacyCompat({
      // options
      commaStyleColorFunction: true,
      legacyColorSpace: true
    }),
  ],
})
```

## Options

### `commaStyleColorFunction`

- **Type:** `boolean`
- **Default:** `false`

Convert color functions (`rgb()` and `hsl()`) from space-separated to comma-separated, for better compatibility with legacy browsers. Bring back the old behavior before UnoCSS v0.57.0 that was changed to space-separated in [#3221](https://github.com/unocss/unocss/pull/3221) to align with Tailwind CSS.

For examples:

- `rgb(255 0 0)` -> `rgb(255, 0, 0)`
- `rgb(255 0 0 / 50%)` -> `rgba(255, 0, 0, 50%)`
- `hsl(0 100% 50% / 50%)` -> `hsla(0, 100%, 50%, 50%)`

### `legacyColorSpace`

- **Type:** `boolean`
- **Default:** `false`

Removes color space keywords such as `in oklch` and `in oklab` from the generated styles. This is useful for ensuring compatibility with legacy browsers that do not support these modern color spaces.

To enable this feature, set the `legacyColorSpace` option to `true`.
