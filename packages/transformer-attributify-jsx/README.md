# @unocss/transformer-attributify-jsx

<!-- @unocss-ignore -->

happy play with preset-attributify in jsx/tsx

## Install

```bash
npm i -D @unocss/transformer-attributify-jsx
```

```ts
// uno.config.js
import {defineConfig} from 'unocss'
import transformerAttributifyJsx from "@unocss/transformer-attributify-jsx"
import {presetAttributify} from "unocss/src";

export default defineConfig({
  // ...
  transformers: [
    transformerAttributifyJsx({
      blocklist: ['text-red']
    }),
  ],
  presets: [
    // ...
    presetAttributify()
  ]
})
```
```ts
export interface TransformerAttributifyJsxOptions {
  /**
   * the list of attributes to ignore
   * @default []
   */
  blocklist?: (string | RegExp)[]
}
```

## Notice

> ⚠️ The rules are almost the same as those of `preset-attributify`, but there are several precautions

```vue
<div translate-x-100% /> // cannot end with `%`
<div hover:text-2xl /> // cannot contain `:`
<div translate-x-[100px] /> // cannot contain `[` or `]`
```

# Usage

```js
transformerAttributifyJsx({
  blocklist: ['text-red', 'text-center']
})
```
```jsx
<div flex text-red text-5xl animate-bounce>
  unocss
</div>
```

Will be compiled to:

```html
<div flex text-red text-5xl="" animate-bounce="">
    unocss
</div>
```

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
