# @unocss/loader-lightningcss

<!-- @unocss-ignore -->

Lightning CSS loader for UnoCSS running in Node.js.

## Install

```bash
npm i -D @unocss/loader-lightningcss
```

## Usage

```ts
import loaderLightningCSS from '@unocss/loader-lightningcss'
import { defineConfig } from 'unocss'

export default defineConfig({
  // ...
  loaders: [
    loaderLightningCSS({
      minify: true,
      targets: {
        // Example: modern browsers
        chrome: 111 << 16,
        safari: 15 << 16,
      },
    }),
  ],
})
```

## Options

The loader accepts all LightningCSS `TransformOptions` except `code` and `filename`.

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
