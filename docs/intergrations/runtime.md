# @unocss/runtime

**Expiremental** CSS-in-JS runtime of UnoCSS.

## CDN Usage

Add this line to your `index.html` and play:

```html
<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>
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

The runtime does not come with preflights, if you want to have style resets, you can either add your own, or use one from `@unocss/reset`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@unocss/reset/normalize.min.css">
<!-- or -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css">
```

### CDN Builds

###### Core

Without any preset:

```html
<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime/core.global.js"></script>
```

###### Uno (default)

With `@unocss/preset-uno` preset:

```html
<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime/uno.global.js"></script>
```

###### Attributify

With `@unocss/preset-uno` and `@unocss/preset-attributify` presets:

```html
<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime/attributify.global.js"></script>
```

###### Mini

With `@unocss/preset-mini` and `@unocss/preset-attributify` preset:

```html
<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime/mini.global.js"></script>
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
