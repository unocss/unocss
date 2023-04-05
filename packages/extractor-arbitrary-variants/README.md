# @unocss/extractor-arbitrary-variants

Exactor to support arbitrary variants for utilities.

## Installation

```bash
npm i -D @unocss/extractor-arbitrary-variants
```

```ts
import extractorArbitrary from '@unocss/extractor-arbitrary-variants'

UnoCSS({
  extractors: [
    extractorArbitrary()
  ],
})
```

## Usage

```html
<div class="[&>*]:m-1 [&[open]]:p-2"></div>
```

Will be captured with `[&>*]:m-1` and `[&[open]]:p-2` as variants.

## License

MIT License &copy; 2022-PRESENT [Anthony Fu](https://github.com/antfu)
