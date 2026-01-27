# @unocss/transformer-variant-group

<!-- @unocss-ignore -->

Enables the [variant group feature of Windi CSS](https://windicss.org/features/variant-groups.html) for UnoCSS.

## Install

```bash
npm i -D @unocss/transformer-variant-group
```

```ts
import transformerVariantGroup from '@unocss/transformer-variant-group'
// uno.config.ts
import { defineConfig } from 'unocss'

export default defineConfig({
  // ...
  transformers: [
    transformerVariantGroup(),
  ],
})
```

## Usage

```html
<div class="hover:(bg-gray-400 font-medium) font-(light mono)" />
```

Will be transformed to:

```html
<div class="hover:bg-gray-400 hover:font-medium font-light font-mono" />
```

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
