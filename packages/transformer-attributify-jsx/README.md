# @unocss/transformer-attributify-jsx

<!-- @unocss-ignore -->

Support [valueless attributify](https://github.com/unocss/unocss/tree/main/packages/preset-attributify#valueless-attributify) in JSX/TSX.

```jsx
export function Component() {
  return (
    <div text-red text-center text-5xl animate-bounce>
      unocss
    </div>
  )
}
```

Will be transformed to:

```jsx
export function Component() {
  return (
    <div text-red="" text-center="" text-5xl="" animate-bounce="">
      unocss
    </div>
  )
}
```

<details>
<summary>Without this transformer</summary>

JSX by default will treat valueless attributes as boolean attributes.

```jsx
export function Component() {
  return (
    <div text-red={true} text-center={true} text-5xl={true} animate-bounce={true}>
      unocss
    </div>
  )
}
```

</details>

## Install

```bash
npm i -D @unocss/transformer-attributify-jsx
```

```ts
// uno.config.ts
import { defineConfig, presetAttributify } from 'unocss'
import transformerAttributifyJsx from '@unocss/transformer-attributify-jsx'

export default defineConfig({
  // ...
  presets: [
    // ...
    presetAttributify()
  ],
  transformers: [
    transformerAttributifyJsx(), // <--
  ],
})
```

## Caveats

If you encounter any issues with this package, there is [@unocss/transformer-attributify-jsx-babel](https://github.com/unocss/unocss/tree/main/packages/transformer-attributify-jsx-babel) package that uses Babel to transform JSX.

> ⚠️ The rules are almost the same as those of `preset-attributify`, but there are several precautions

```html
<div translate-x-100% /> <!-- cannot end with `%` -->

<div translate-x-[100px] /> <!-- cannot contain `[` or `]` -->
```

Instead, you may want to use valued attributes instead:

```html
<div translate="x-100%" />

<div translate="x-[100px]" />
```

## Blocklist

This transformer will only transform attributes that are valid UnoCSS utilities.
You can also `blocklist` bypass some attributes from been transformed.

```js
transformerAttributifyJsx({
  blocklist: [/text-[a-zA-Z]*/, 'text-5xl']
})
```

```jsx
<div text-red text-center text-5xl animate-bounce>
  unocss
</div>
```

Will be compiled to:

```html
<div text-red text-center text-5xl animate-bounce="">
  unocss
</div>
```

## License

MIT License &copy; 2022-PRESENT [Anthony Fu](https://github.com/antfu)
