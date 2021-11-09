# @unocss/runtime

**Expiremental** CSS-in-JS runtime of UnoCSS.

## CDN Usage

Add this line to your `index.html` and play:

```html
<script src="https://unpkg.com/@unocss/runtime"></script>
```

To configure UnoCSS (optional):

```html
<script>
// pass unocss options
window.__unocss = {
  rules: [
    // custom rules...
  ],
  presets: [
    // custom presets...
  ],
  // ...
}
</script>
```

By default, `@unocss/preset-uno` will be applied.

### CDN Builds

###### Core

Without any preset:

```html
<script src="https://unpkg.com/@unocss/runtime/core.global.js"></script>
```

###### Uno (default)

With `@unocss/preset-uno` preset:

```html
<script src="https://unpkg.com/@unocss/runtime/uno.global.js"></script>
```

###### Attributify

With `@unocss/preset-uno` and `@unocss/preset-attributify` presets:

```html
<script src="https://unpkg.com/@unocss/runtime/attributify.global.js"></script>
```

## Bundler Usage

```bash
npm i @unocss/runtime
```

```ts
import initUnocssRuntime from '@unocss/runtime'

initUnocssRuntime({ /* options */ })
```

## License

[MIT](./LICENSE) License © 2021 [Anthony Fu](https://github.com/antfu)
