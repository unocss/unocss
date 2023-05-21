# Presets

Presets are partial configurations that will be merged into the main configuration.

When authoring a presets, we usually export a constractor functions that you could ask for some preset-specific options. For example:

```ts
// my-preset.ts
import { Preset } from 'unocss'

export default function myPreset(options: MyPresetOptions): Preset {
  return {
    name: 'my-preset',
    rules: [
      // ...
    ],
    variants: [
      // ...
    ],
    // it supports most of the configuration you could have in the root config
  }
}
```

Then the user can use it like this:

```ts
// uno.config.ts
import { defineConfig } from 'unocss'
import myPreset from './my-preset'

export default defineConfig({
  presets: [
    myPreset({ /* preset options */ }),
  ],
})
```

You can check [official presets](/presets/) and [community presets](/presets/community) for more examples.

