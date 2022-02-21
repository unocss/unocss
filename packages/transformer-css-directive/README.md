# @unocss/transformer-css-directive

UnoCSS transformer for `@apply` directive

## Install

```bash
npm i -D @unocss/transformer-css-directive
```

```ts
import Unocss from 'unocss/vite'
import transformerDirective from '@unocss/transformer-css-directive'

Unocss({
  transformers: [
    transformerDirective(),
  ]
})
```

## Usage

Currently only `@apply` is supported.

## License

MIT License © 2021-PRESENT [Anthony Fu](https://github.com/antfu)
