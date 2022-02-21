# @unocss/transformer-directives

UnoCSS transformer for `@apply` directive

## Install

```bash
npm i -D @unocss/transformer-directives
```

```ts
import Unocss from 'unocss/vite'
import transformerDirective from '@unocss/transformer-directives'

Unocss({
  transformers: [
    transformerDirective(),
  ]
})
```

## Usage

Currently only `@apply` is supported.

## License

MIT License © 2022 [hannoeru](https://github.com/hannoeru)
