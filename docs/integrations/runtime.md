---
title: UnoCSS CDN Runtime
description: CSS-in-JS runtime of UnoCSS (@unocss/runtime).
outline: deep
---

# Runtime

UnoCSS runtime provide a CDN build that runs the UnoCSS right in the browser. It will detect the DOM changes and generate the styles on the fly.

## Usage

Add the following line to your `index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>
```

The runtime may be configured by defining the configuration before loading the runtime:

```html
<!-- define unocss options... -->
<script>
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
<!-- ... and then load the runtime -->
<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>
```

By default, the [Uno preset](/presets/uno) is be applied.

The runtime does not come with preflights, if you want to have style resets, you can either add your own, or use one from [Reset package](/guide/style-reset).

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@unocss/reset/normalize.min.css">
<!-- or -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css">
```

## Builds

Several builds are available for different use cases.

### Uno (default)

With `@unocss/preset-uno` preset:

```html
<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime/uno.global.js"></script>
```

### Attributify

With `@unocss/preset-uno` and `@unocss/preset-attributify` presets:

```html
<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime/attributify.global.js"></script>
```

### Mini

With `@unocss/preset-mini` and `@unocss/preset-attributify` preset:

```html
<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime/mini.global.js"></script>
```

### Core

If you need to mix and match presets, you can load only the core runtime and assign the presets manually. All the [official presets](/presets/#presets) from UnoCSS are available. Load the one you need before initializing the core runtime.

```html
<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime/preset-icons.global.js"></script>
<script>
  window.__unocss = {
    presets: [
      () => window.__unocss_runtime.presets.presetIcons({
        scale: 1.2,
        cdn: 'https://esm.sh/'
      }),
    ],
  }
</script>
<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime/core.global.js"></script>
```

## Bundler Usage

```bash
npm i @unocss/runtime
```

```ts
import initUnocssRuntime from '@unocss/runtime'

initUnocssRuntime({ /* options */ })
```

## Preventing FOUC

Since UnoCSS runs after the DOM is ready, there can be a "flash of unstyled content" (FOUC) which may leads the user to see the page as unstyled.

Use `un-cloak` attribute with CSS rules such as `[un-cloak] { display: none }` to hide the unstyled element until UnoCSS applies the styles for it.

::: code-group
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
:::
