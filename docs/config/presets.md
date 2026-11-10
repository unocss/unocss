# Presets

Presets are partial configurations that will be merged into the main configuration.

When authoring a preset, we usually export a constructor function that you could ask for some preset-specific options. For example:

```ts [my-preset.ts]
import { definePreset, Preset } from 'unocss'

export default definePreset((options?: MyPresetOptions) => {
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
})
```

Then the user can use it like this:

```ts [uno.config.ts]
import { defineConfig } from 'unocss'
import myPreset from './my-preset'

export default defineConfig({
  presets: [
    myPreset({ /* preset options */ }),
  ],
})
```

You can check [official presets](/presets/) and [community presets](/presets/community) for more examples.

## Metadata for each resolved configuration

A preset can provide `resolveMeta(meta)` to create metadata for each
configuration resolution. It runs before theme extenders and `configResolved`
hooks, even when an already-resolved preset is reused. Return fresh mutable
collections instead of mutating the input metadata:

```ts
const preset = {
  name: 'usage-tracker',
  meta: { description: 'Used values' },
  resolveMeta: meta => ({ ...meta, used: new Set<string>() }),
}
```

Only presets opting into this callback receive a detached resolved record.
Other presets retain their existing identity and metadata. The resolved marker,
prototype and unrelated record descriptors are preserved; `meta` contains the callback's
result. Read the new metadata from the resolved config rather than a reusable
raw preset reference. This callback initializes metadata only and does not
change config hook order.
