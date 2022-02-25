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
.myDiv {
    @apply text-center my-0 font-medium;
   }
```

Will be transformed to:

```css
.myDiv {
 text-align: center;
 padding: 1em;
 margin-top: 0rem;
 margin-bottom: 0rem;
 font-weight: 500;
   }

``` 

Currently only `@apply` is supported.

## License

MIT License © 2022 [hannoeru](https://github.com/hannoeru)
