---
title: Presets
description: Presets are the heart of UnoCSS. They let you make your own custom framework in minutes.
---

# Presets

Presets are the heart of UnoCSS. They let you make your own custom framework in minutes.

### Using presets

To set presets to your project:

```ts
// vite.config.ts
import UnoCSS from 'unocss/vite'
import { presetAttributify, presetUno } from 'unocss'

export default {
  plugins: [
    UnoCSS({
      presets: [
        presetAttributify({ /* preset options */}),
        presetUno(),
        // ...custom presets
      ],
    }),
  ],
}
```

When the `presets` option is specified, the default preset will be ignored.

To disable the default preset, you can set `presets` to an empty array:

```ts
// vite.config.ts
import UnoCSS from 'unocss/vite'

export default {
  plugins: [
    UnoCSS({
      presets: [], // disable default preset
      rules: [
        // your custom rules
      ],
    }),
  ],
}
```
