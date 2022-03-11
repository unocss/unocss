# @unocss/extractor-pug

Pug extractor for UnoCSS.

## Install

```bash
npm i -D @unocss/extractor-pug
```

```ts
import extractorPug from '@unocss/extractor-pug'
import { extractorSplit } from '@unocss/core'

Unocss({
  extractors: [
    extractorPug(),
    extractorSplit,
  ],
})
```

## License

MIT License © 2021-PRESENT [Anthony Fu](https://github.com/antfu)
