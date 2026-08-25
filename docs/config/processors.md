# Processors

Processors are hooks that transform generated CSS. Unlike [transformers](/config/transformers), which modify source code before extraction, processors run after UnoCSS has generated its CSS layers.

## Define a processor

A processor receives the CSS for one layer and returns the CSS that should replace it. Both synchronous and asynchronous results are supported.

```ts [uno.config.ts]
import type { CSSProcessor } from '@unocss/core'
import { defineConfig } from 'unocss'

const banner: CSSProcessor = {
  name: 'add-banner',
  order: 10,
  process(css, { layer, envMode }) {
    if (envMode !== 'build')
      return css
    return `/* generated layer: ${layer} */\n${css}`
  },
}

export default defineConfig({
  processors: [banner],
})
```

## Processing flow

For every non-empty CSS layer, UnoCSS performs these steps:

1. Generate the raw layer CSS, including preflights and any enabled CSS layer wrapper or layer marker.
2. Sort processors by `order` in ascending order.
3. Pass the layer through each processor sequentially. The output of one processor becomes the input of the next.
4. Cache the processed layer and expose it through `getLayer()`, `getLayers()`, and `css`.

Different layers may be processed concurrently. A processor should avoid relying on mutable state shared between layers.

When `setLayer()` changes a layer, its callback receives the raw, unprocessed CSS. UnoCSS then runs the updated CSS through the complete processor chain again. This prevents processors from being applied repeatedly to their own previous output.

```text
generated layer
  -> processor 1
  -> processor 2
  -> processed layer output
```

If a processor throws an error, generation fails and the error is passed to the caller.

## Context

The second argument passed to `process()` is a `CSSProcessorContext`:

```ts
interface CSSProcessorContext<Theme extends object = object> {
  layer: string
  theme: Theme
  envMode: 'dev' | 'build'
}
```

- `layer` is the name of the current generated layer.
- `theme` is the resolved UnoCSS theme.
- `envMode` indicates whether UnoCSS is generating CSS for development or production builds.

## Processor order

Processors with a lower `order` run first. Processors without an explicit order use `0`.

```ts
processors: [
  { name: 'minify', order: 20, process: minify },
  { name: 'prefix', order: 10, process: addPrefixes },
]
```

In this example, `prefix` runs before `minify`.

Processors declared by presets and the user configuration are merged. The processor `name` identifies it when duplicate processors are removed.

## Official processors

- [Lightning CSS processor](/processors/lightningcss)
