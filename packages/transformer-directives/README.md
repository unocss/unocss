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

```css
.custom-div {
  @apply text-center my-0 font-medium;
}
```

Will be transformed to:

```css
.custom-div {
  margin-top: 0rem;
  margin-bottom: 0rem;
  text-align: center;
  font-weight: 500;
}
```

> Currently only `@apply` is supported.

## License

MIT License © 2022 [hannoeru](https://github.com/hannoeru)
