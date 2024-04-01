---
title: Presets
description: Presets are the heart of UnoCSS. They let you make your own custom framework in minutes.
outline: deep
---

# Presets

Presets are the heart of UnoCSS. They let you make your own custom framework in minutes.

### Using presets

To set presets to your project:

```ts twoslash
// uno.config.ts
import { defineConfig, presetAttributify, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetAttributify({ /* preset options */}),
    presetUno(),
    // ...custom presets
  ],
})
```

When the `presets` option is specified, the default preset will be ignored.

To disable the default preset, you can set `presets` to an empty array:

```ts twoslash
// uno.config.ts
import { defineConfig } from 'unocss'

export default defineConfig({
  presets: [], // disable default preset
  rules: [
    // your custom rules
  ],
})
```

You can check [official presets](/presets/) and [community presets](/presets/community) for more.

### Creating presets

To see how you can create your own custom preset, see [Config: presets](/config/presets).
