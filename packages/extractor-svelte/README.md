# @unocss/extractor-svelte

Svelte extractor for UnoCSS.

Supports extracting classes from `class:` directive.

```html
<div class:text-orange-400={foo} />
```

Will be extracted as `text-orange-400`.

## Install

```bash
npm i -D @unocss/extractor-svelte
```

```ts
import extractorSvelte from '@unocss/extractor-svelte'

UnoCSS({
  extractors: [
    extractorSvelte(),
  ],
})
```

## License

MIT License &copy; 2023-PRESENT [Anthony Fu](https://github.com/antfu)
