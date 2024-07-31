---
title: UnoCSS Vite Plugin
description: The Vite plugin for UnoCSS (@unocss/vite).
outline: deep
---

<script setup lang="ts">
import { examples } from '../.vitepress/content'

const playgrounds = examples.reduce((acc, cur) => {
  acc[cur.name] = cur
  return acc
}, {})
</script>

# Vite Plugin

The Vite plugin ships with the `unocss` package.

## Installation

::: code-group
  ```bash [pnpm]
  pnpm add -D unocss
  ```
  ```bash [yarn]
  yarn add -D unocss
  ```
  ```bash [npm]
  npm install -D unocss
  ```
:::

Install the plugin:

```ts
// vite.config.ts
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    UnoCSS(),
  ],
})
```

Create a `uno.config.ts` file:

```ts
// uno.config.ts
import { defineConfig } from 'unocss'

export default defineConfig({
  // ...UnoCSS options
})
```

Add `virtual:uno.css` to your main entry:

```ts
// main.ts
import 'virtual:uno.css'
```

## Modes

The Vite plugin comes with a set of modes that enable different behaviors.

### `global` (default)

This is the default mode for the plugin: in this mode you need to add the import of `uno.css` on your entry point.

This mode enables a set of Vite plugins for `build` and for `dev` with `HMR` support.

The generated `css` will be a global stylesheet injected on the `index.html`.

### `vue-scoped`

This mode will inject generated CSS to Vue SFCs `<style scoped>` for isolation.

### `svelte-scoped`

`svelte-scoped` mode has been moved to its own package, see [@unocss/svelte-scoped/vite](/integrations/svelte-scoped).

### `shadow-dom`

Since `Web Components` uses `Shadow DOM`, there is no way to style content directly from a global stylesheet (unless you use `CSS custom properties`, those will penetrate the `Shadow DOM`), you need to inline the generated CSS by the plugin into the `Shadow DOM` style.

To inline the generated CSS, you only need to configure the plugin mode to `shadow-dom` and include `@unocss-placeholder` magic placeholder on each web component style CSS block. If you are defining your Web Components in Vue SFCs and want to define custom styles alongside UnoCSS, you can wrap placeholder in a CSS comment to avoid syntax errors in your IDE.

### `per-module` (experimental)

This mode will generate a CSS sheet for each module, can be scoped.

### `dist-chunk` (experimental)

This mode will generate a CSS sheet for each code chunk on build, great for MPA.

## Edit classes in DevTools

Because of limitation of "on-demand" where the DevTools don't know those you haven't used in your source code yet. So if you want to try how things work by directly changing the classes in DevTools, just add the following lines to your main entry.

```ts
import 'uno.css'
import 'virtual:unocss-devtools'
```

::: warning
Please use it with caution, under the hood we use [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) to detect the class changes. Which means not only your manual changes but also the changes made by your scripts will be detected and included in the stylesheet. This could cause some misalignment between dev and the production build when you add dynamic classes based on some logic in script tags. We recommended adding your dynamic parts to the [safelist](https://github.com/unocss/unocss/issues/511) or setup UI regression tests for your production build if possible.
:::

## Frameworks

Some UI/App frameworks have some caveats that must be fixed to make it work, if you're using one of the following frameworks, just apply the suggestions.

### VanillaJS / TypeScript

When using VanillaJS or TypeScript, you need to add `js` and `ts` files extensions to allow UnoCSS read and parse the content, by default `js` and `ts` files are excluded, check out the [Extracting from Build Tools Pipeline](/guide/extracting#extracting-from-build-tools-pipeline) section.

### React

If you're using `@vitejs/plugin-react`:

```ts
// vite.config.js
import UnoCSS from 'unocss/vite'
import React from '@vitejs/plugin-react'

export default {
  plugins: [
    React(),
    UnoCSS(),
  ],
}
```

If you're using `@unocss/preset-attributify` you should remove `tsc` from the `build` script.

If you are using `@vitejs/plugin-react` with `@unocss/preset-attributify`, you must add the plugin before `@vitejs/plugin-react`.

```ts
// vite.config.js
import UnoCSS from 'unocss/vite'
import React from '@vitejs/plugin-react'

export default {
  plugins: [
    UnoCSS(),
    React(),
  ],
}
```

You have a `React` example project on [examples/vite-react](https://github.com/unocss/unocss/tree/main/examples/vite-react) directory  using both plugins, check the scripts on `package.json` and its Vite configuration file.

<ContentExample :item="playgrounds['vite-react']"  class="Link" integrations />

### Preact

If you're using `@preact/preset-vite`:

```ts
// vite.config.js
import Preact from '@preact/preset-vite'
import UnoCSS from 'unocss/vite'

export default {
  plugins: [
    UnoCSS(),
    Preact(),
  ],
}
```

or if you're using `@prefresh/vite`:

```ts
// vite.config.js
import Prefresh from '@prefresh/vite'
import UnoCSS from 'unocss/vite'

export default {
  plugins: [
    UnoCSS(),
    Prefresh(),
  ],
}
```

If you're using `@unocss/preset-attributify` you should remove `tsc` from the `build` script.

You have a `Preact` example project on [examples/vite-preact](https://github.com/unocss/unocss/tree/main/examples/vite-preact) directory using both plugins, check the scripts on `package.json` and its Vite configuration file.

<ContentExample :item="playgrounds['vite-preact']"  class="Link" integrations />

### Svelte

You must add the plugin before `@sveltejs/vite-plugin-svelte`.

To support `class:foo` and `class:foo={bar}` add the plugin and configure `extractorSvelte` on `extractors` option.

You can use simple rules with `class:`, for example `class:bg-red-500={foo}` or using `shortcuts` to include multiples rules, see `src/App.svelte` on linked example project below.

```ts
// vite.config.js
import { svelte } from '@sveltejs/vite-plugin-svelte'
import UnoCSS from 'unocss/vite'
import extractorSvelte from '@unocss/extractor-svelte'

export default {
  plugins: [
    UnoCSS({
      extractors: [
        extractorSvelte(),
      ],
      /* more options */
    }),
    svelte(),
  ],
}
```

<ContentExample :item="playgrounds['vite-svelte']"  class="Link" integrations />

### Sveltekit

To support `class:foo` and `class:foo={bar}` add the plugin and configure `extractorSvelte` on `extractors` option.

You can use simple rules with `class:`, for example `class:bg-red-500={foo}` or using `shortcuts` to include multiples rules, see `src/routes/+layout.svelte` on linked example project below.

```ts
// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite'
import UnoCSS from 'unocss/vite'
import extractorSvelte from '@unocss/extractor-svelte'

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [
    UnoCSS({
      extractors: [
        extractorSvelte(),
      ],
      /* more options */
    }),
    sveltekit(),
  ],
}
```

<ContentExample :item="playgrounds['sveltekit']"  class="Link mb-4" integrations />

<ContentExample :item="playgrounds['sveltekit-preprocess']"  class="Link mb-4" integrations />

<ContentExample :item="playgrounds['sveltekit-scoped']"  class="Link" integrations />

### Web Components

To work with web components you need to enable `shadow-dom` mode on the plugin.

Don't forget to remove the import for `uno.css` since the `shadow-dom` mode will not expose it and the application will not work.

```ts
// vite.config.js
import UnoCSS from 'unocss/vite'

export default {
  plugins: [
    UnoCSS({
      mode: 'shadow-dom',
      /* more options */
    }),
  ],
}
```

On each `web component` just add `@unocss-placeholder` to its style CSS block:
```ts
const template = document.createElement('template')
template.innerHTML = `
<style>
:host {...}
@unocss-placeholder
</style>
<div class="m-1em">
...
</div>
`
```

If you're using [Lit](https://lit.dev/):

```ts
@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    :host {...}
    @unocss-placeholder
  `
  // ...
}
```

You have a `Web Components` example project on [examples/vite-lit](https://github.com/unocss/unocss/tree/main/examples/vite-lit) directory.

#### `::part` built-in support

You can use `::part` since the plugin supports it via `shortcuts` and using `part-[<part-name>]:<rule|shortcut>` rule from `preset-mini`, for example using it with simple rules like `part-[<part-name>]:bg-green-500` or using some `shortcut`: check `src/my-element.ts` on linked example project below.

The `part-[<part-name>]:<rule|shortcut>` will work only with this plugin using the `shadow-dom` mode.

The plugin uses `nth-of-type` to avoid collisions with multiple parts in the same web component and for the same parts on distinct web components, you don't need to worry about it, the plugin will take care for you.

```ts
// vite.config.js
import UnoCSS from 'unocss/vite'

export default {
  plugins: [
    UnoCSS({
      mode: 'shadow-dom',
      shortcuts: [
        { 'cool-blue': 'bg-blue-500 text-white' },
        { 'cool-green': 'bg-green-500 text-black' },
      ],
      /* more options */
    }),
  ],
}
```

then in your web components:

```ts
// my-container-wc.ts
const template = document.createElement('template')
template.innerHTML = `
<style>
@unocss-placeholder
</style>
<my-wc-with-parts class="part-[cool-part]:cool-blue part-[another-cool-part]:cool-green">...</my-wc-with-parts>
`
```

```ts
// my-wc-with-parts.ts
const template = document.createElement('template')
template.innerHTML = `
<style>
@unocss-placeholder
</style>
<div>
  <div part="cool-part">...</div>
  <div part="another-cool-part">...</div>
</div>
`
```
<ContentExample :item="playgrounds['vite-lit']"  class="Link" integrations />

### Solid

You need to add the `vite-plugin-solid` plugin after UnoCSS's plugin.

```ts
// vite.config.js
import solidPlugin from 'vite-plugin-solid'
import UnoCSS from 'unocss/vite'

export default {
  plugins: [
    UnoCSS({
      /* options */
    }),
    solidPlugin(),
  ],
}
```

<ContentExample :item="playgrounds['vite-solid']"  class="Link" integrations />

### Elm

You need to add the `vite-plugin-elm` plugin before UnoCSS's plugin.

```ts
// vite.config.js
import { defineConfig } from 'vite'
import Elm from 'vite-plugin-elm'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    Elm(),
    UnoCSS(),
  ],
})
```

<ContentExample :item="playgrounds['vite-elm']"  class="Link" integrations />

## Legacy

If `@vitejs/plugin-legacy` with `renderModernChunks: false`, your need add it to `unocss` option

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import { presetUno } from 'unocss'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    vue(),
    Unocss({
      presets: [presetUno()],
      legacy: {
        renderModernChunks: false,
      },
    }),
    legacy({
      targets: ['defaults', 'not IE 11'],
      renderModernChunks: false,
    }),
  ],
})
```

## License

- MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
