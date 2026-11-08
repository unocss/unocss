# @unocss/transformer-build-themes

<!-- @unocss-ignore -->

Build-time themes for UnoCSS. Each build keeps the classes of its active themes and removes every other theme's classes from the source, before HTML and CSS are compiled. Unused themes never reach the markup, the client JS or the stylesheet.

Made for white-label products: one codebase, one build per customer.

## Install

```bash
npm i -D @unocss/transformer-build-themes
```

```ts
import transformerBuildThemes from '@unocss/transformer-build-themes'
// uno.config.ts
import { defineConfig } from 'unocss'

export default defineConfig({
  // ...
  transformers: [
    transformerBuildThemes({
      themes: { client: ['acme', 'globex'] },
      active: { client: process.env.CLIENT ?? 'acme' },
    }),
  ],
})
```

## Usage

```html
<button class="px-4 py-2 acme:(bg-red c-white) globex:(bg-blue rounded-full)" />
```

Will be transformed to, when `acme` is active:

```html
<button class="px-4 py-2 bg-red c-white" />
```

## License

MIT License &copy; 2026-PRESENT [Andrii Bohdanov](https://github.com/AndrewBogdanovTSS)
