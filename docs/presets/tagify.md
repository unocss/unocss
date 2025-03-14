---
title: Tagify preset
description: Tagify Mode for UnoCSS (@unocss/preset-tagify).
outline: deep
---

# Tagify preset

This enables the [tagify mode](#tagify-mode) for other presets.

[Source Code](https://github.com/unocss/unocss/tree/main/packages-presets/preset-tagify)

## Installation

::: code-group

```bash [pnpm]
pnpm add -D @unocss/preset-tagify
```

```bash [yarn]
yarn add -D @unocss/preset-tagify
```

```bash [npm]
npm install -D @unocss/preset-tagify
```

```bash [bun]
bun add -D @unocss/preset-tagify
```

:::

```ts [uno.config.ts]
import presetTagify from '@unocss/preset-tagify'
import { defineConfig } from 'unocss'

export default defineConfig({
  presets: [
    presetTagify({ /* options */ }),
    // ...other presets
  ],
})
```

## Tagify mode

This preset can come in handy when you only need to apply a single unocss rule to an element.

```html
<span class="text-red"> red text </span>
<div class="flex">flexbox</div>
I'm feeling <span class="i-line-md-emoji-grin"></span> today!
```

With tagify mode, you can embed CSS styles into HTML tags:

```html
<text-red> red text </text-red>
<flex> flexbox </flex>
I'm feeling <i-line-md-emoji-grin /> today!
```

The HTML above works exactly as you would expect.

## With prefix

```js
presetTagify({
  prefix: 'un-'
})
```

```html
<!-- this will be matched -->
<un-flex> </un-flex>
<!-- this will not be matched -->
<flex> </flex>
```

## Extra properties

You can inject extra properties to the matched rules:

```js
presetTagify({
  // adds display: inline-block to matched icons
  extraProperties: matched => matched.startsWith('i-')
    ? { display: 'inline-block' }
    : { }
})
```

```js
presetTagify({
  // extraProperties can also be a plain object
  extraProperties: { display: 'block' }
})
```

## Options

### prefix

- **Type:** `string`

The prefix to use for the tagify variant.

### excludedTags

- **Type:** `string[] | RegExp[]`
- **Default:** `['b', /^h\d+$/, 'table']`

Tags excluded from processing.

### extraProperties

- **Type:** `Record<string, string> | ((matched: string) => Partial<Record<string, string>>)`

Extra CSS properties to apply to matched rules.

### defaultExtractor

- **Type:** `boolean`
- **Default:** `true`

Enable default extractor.
