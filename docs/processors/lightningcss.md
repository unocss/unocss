---
title: Lightning CSS processor
description: Process generated UnoCSS output with Lightning CSS in Node.js (@unocss/processor-lightningcss).
outline: deep
---

# Lightning CSS processor

`@unocss/processor-lightningcss` processes each generated UnoCSS layer with [Lightning CSS](https://lightningcss.dev/). It can minify CSS, compile modern CSS syntax, and add compatibility transforms for your browser targets.

[Source Code](https://github.com/unocss/unocss/tree/main/packages-presets/processor-lightningcss)

## Installation

::: code-group

```bash [pnpm]
pnpm add -D @unocss/processor-lightningcss
```

```bash [yarn]
yarn add -D @unocss/processor-lightningcss
```

```bash [npm]
npm install -D @unocss/processor-lightningcss
```

```bash [bun]
bun add -D @unocss/processor-lightningcss
```

:::

## Usage

Add the processor to the [`processors`](/config/processors) array in your UnoCSS configuration:

```ts [uno.config.ts]
import processorLightningCSS from '@unocss/processor-lightningcss'
import { defineConfig } from 'unocss'

export default defineConfig({
  processors: [
    processorLightningCSS({
      targets: {
        chrome: 111 << 16,
        safari: 15 << 16,
      },
    }),
  ],
})
```

The processor runs after UnoCSS generates each non-empty layer. Its output is returned by `getLayer()`, `getLayers()`, and the generated `css` result.

## Options

The processor accepts Lightning CSS [`TransformOptions`](https://github.com/parcel-bundler/lightningcss/blob/master/node/index.d.ts), except for `code` and `filename`. UnoCSS supplies those values for each generated layer.

The current layer name is used as the filename. For example, the `utilities` layer is passed to Lightning CSS as `utilities.css`, which makes transformation errors easier to identify.

### Minification

By default, minification is enabled when `envMode` is `build` and disabled when it is `dev`. Set `minify` explicitly to override that behavior:

```ts [uno.config.ts]
processorLightningCSS({
  minify: true,
})
```

### Browser targets

Use `targets` to control which compatibility transforms Lightning CSS applies:

```ts [uno.config.ts]
processorLightningCSS({
  targets: {
    chrome: 111 << 16,
    firefox: 113 << 16,
    safari: 15 << 16,
  },
})
```

## Node.js only

This processor uses the native Node.js build of Lightning CSS and is intended for build-time usage. When it is invoked outside Node.js, UnoCSS emits a warning once and returns the original CSS unchanged.

## License

- MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
