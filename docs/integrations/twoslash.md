---
title: Twoslash Integration
---

# Twoslash Integration

`@unocss/twoslash` provides [twoslash](https://twoslash.netlify.app/) integration for UnoCSS, annotating code blocks with generated CSS output, useful in documentation sites powered by [VitePress](https://vitepress.dev).

```ts twoslash [uno.config.ts]
import { defineConfig } from 'unocss'

export default defineConfig({
  rules: [
    ['m-1', { margin: '1px' }],
  ],
})
```

## Installation

```bash
npm add @unocss/twoslash
```

## Usage with VitePress

In your `.vitepress/config.ts`:

```ts
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { createTwoslasher } from '@unocss/twoslash'
import { defineConfig } from 'vitepress'

export default defineConfig({
  markdown: {
    codeTransformers: [
      transformerTwoslash({
        langs: ['vue', 'html'],
        twoslasher: createTwoslasher(),
      }),
    ],
  },
})
```

Then use `twoslash` in your fenced code blocks:

```html twoslash
<div class="p-4 text-red"></div>
```

## Options

### `configPath`

Path to your UnoCSS config file. If not provided, it will search up the directory tree automatically.

```ts
createTwoslasher({
  configPath: './my-uno.config.ts',
})
```

### `preprocess`

Custom code transform before sending to UnoCSS for generation. This does not affect the rendered code.

```ts
createTwoslasher({
  preprocess: code => code.replace(/\/\/.*$/gm, ''),
})
```
