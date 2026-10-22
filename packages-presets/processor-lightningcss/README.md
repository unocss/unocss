# @unocss/processor-lightningcss

<!-- @unocss-ignore -->

Lightning CSS processor for UnoCSS running in Node.js.

## Install

```bash
npm i -D @unocss/processor-lightningcss
```

## Usage

```ts
import processorLightningCSS from '@unocss/processor-lightningcss'
import { defineConfig } from 'unocss'

export default defineConfig({
  // ...
  processors: [
    processorLightningCSS({
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

The processor accepts all Lightning CSS `TransformOptions` except `code` and `filename`.

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
