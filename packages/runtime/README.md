# @unocss/runtime

CSS-in-JS runtime of UnoCSS.

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

## Preventing flash of unstyled content

Since UnoCSS runs after the DOM is present, there can be a "flash of unstyled content" which may leads the user to see the page as unstyled.

Use `un-cloak` attribute with CSS rules such as `[un-cloak] { display: none }` to hide the unstyled element until UnoCSS applies the styles for it.

```css
[un-cloak] {
  display: none;
}
```

```html
<div class="text-blue-500" un-cloak>
  This text will only be visible in blue color.
</div>
```

## License

MIT License © 2021-PRESENT [Anthony Fu](https://github.com/antfu)
