# @unocss/loader-lightningcss

<!-- @unocss-ignore -->

LightningCSS loader for UnoCSS. In Node environments it uses `lightningcss`, and in non-Node environments it falls back to `lightningcss-wasm`.

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
        chrome: 111,
        safari: 15,
      },
    }),
  ],
})
```

## Options

The loader accepts all LightningCSS `TransformOptions` except `code` and `filename`.

## Notes

- In non-Node environments, the loader initializes `lightningcss-wasm` once and reuses it.
- Ensure your bundler supports loading WASM when targeting browsers.

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
