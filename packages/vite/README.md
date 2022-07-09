# @unocss/vite

The Vite plugin for UnoCSS. Ships with the `unocss` package.

> This plugin does not come with any default presets. You are building a meta framework on top of UnoCSS, see [this file](https://github.com/unocss/unocss/blob/main/packages/unocss/src/vite.ts) for an example to bind the default presets.

## Installation

```bash
npm i -D unocss
```

```ts
// vite.config.ts
import Unocss from 'unocss/vite'

export default {
  plugins: [
    Unocss({ /* options */ }),
  ],
}
```

Add `uno.css` to your main entry:

```ts
// main.ts
import 'uno.css'
```

### Presetless usage

```bash
npm i -D @unocss/vite
```

```ts
// vite.config.ts
import Unocss from '@unocss/vite'

export default {
  plugins: [
    Unocss({
      presets: [
        /* no presets by default */
      ],
      /* options */
    }),
  ],
}
```

## Modes

The Vite plugin comes with a set of modes that enable different behaviors.

###### `global` (default)

This is the default mode for the plugin: in this mode you need to add the import of `uno.css` on your entry point.

This mode enables a set of Vite plugins for `build` and for `dev` with `HMR` support.

The generated `css` will be a global stylesheet injected on the `index.html`.

###### `vue-scoped`

This mode will inject generated CSS to Vue SFC's `<style scoped>` for isolation.

###### `svelte-scoped`

This mode will inject generated CSS to Svelte's `<style>` for isolation.

###### `shadow-dom`

Since `Web Components` uses `Shadow DOM`, there is no way to style content directly from a global stylesheet (unless you use `custom css vars`, those will penetrate the `Shadow DOM`), you need to inline the generated css by the plugin into the `Shadow DOM` style.

To inline the generated css, you only need to configure the plugin mode to `shadow-dom` and include `@unocss-placeholder` magic placeholder on each web component style css block.

###### `per-module` (Experimental)

This mode will generate a CSS sheet for each module, can be scoped.

###### `dist-chunk` (Experimental)

This mode will generate a CSS sheet for each code chunk on build, great for MPA.

## "Design in DevTools"

Because of limitation of "on-demand" where the DevTools don't know those you haven't used in your source code yet. So if you want to try how things work by directly changing the classes in DevTools, just add the following lines to your main entry.

```ts
import 'uno.css'
import 'virtual:unocss-devtools'
```

> ⚠️ Please use it with caution, under the hood we use [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) to detect the class changes. Which means not only your manual changes but also the changes made by your scripts will be detected and included in the stylesheet. This could cause some misalignment between dev and the production build when you add dynamic classes based on some logic in script tags. We recommended adding your dynamic parts to the [safelist](https://github.com/unocss/unocss/issues/511) or setup UI regression tests for your production build if possible.

`virtual:unocss-devtools` will be an empty bundle in production.

## Frameworks

Some UI/App frameworks have some caveats that must be fixed to make it work, if you're using one of the following frameworks, just apply the suggestions.

### React

**WARNING**: You should import the `uno.css` virtual module using `import 'virtual:uno.css'` instead `import 'uno.css'`. When you start the dev server first time, you'll need to update some style module to get it working (we're trying to fix it).

If you're using `@vitejs/plugin-react`:

```ts
// vite.config.js
import react from '@vitejs/plugin-react'
import Unocss from 'unocss/vite'

export default {
  plugins: [
    react(),
    Unocss({
      /* options */
    }),
  ],
}
```

or if you're using `@vitejs/plugin-react-refresh`:

```ts
// vite.config.js
import reactRefresh from '@vitejs/plugin-react-refresh'
import Unocss from 'unocss/vite'

export default {
  plugins: [
    reactRefresh(),
    Unocss({
      /* options */
    }),
  ],
}
```

If you're using `@unocss/preset-attributify` you should remove `tsc` from the `build` script.

If you are using `@vitejs/plugin-react` with `@unocss/preset-attributify`, you must add the plugin before `@vitejs/plugin-react`.

```ts
// vite.config.js
import react from '@vitejs/plugin-react'
import Unocss from 'unocss/vite'

export default {
  plugins: [
    Unocss({
      /* options */
    }),
    react(),
  ],
}
```

You have a `React` example project on [examples/vite-react](https://github.com/unocss/unocss/tree/main/examples/vite-react) directory  using both plugins, check the scripts on `package.json` and its Vite configuration file.

### Preact

If you're using `@preact/preset-vite`:

```ts
// vite.config.js
import preact from '@preact/preset-vite'
import Unocss from 'unocss/vite'

export default {
  plugins: [
    preact(),
    Unocss({
      /* options */
    }),
  ],
}
```

or if you're using `@prefresh/vite`:

```ts
// vite.config.js
import prefresh from '@prefresh/vite'
import Unocss from 'unocss/vite'

export default {
  plugins: [
    prefresh(),
    Unocss({
      /* options */
    }),
  ],
}
```

If you're using `@unocss/preset-attributify` you should remove `tsc` from the `build` script.

If you are using `@preact/preset-vite` with `@unocss/preset-attributify`, you must add the plugin before `@preact/preset-vite`.

```ts
// vite.config.js
import preact from '@preact/preset-vite'
import Unocss from 'unocss/vite'

export default {
  plugins: [
    Unocss({
      /* options */
    }),
    preact(),
  ],
}
```

You have a `Preact` example project on [examples/vite-preact](https://github.com/unocss/unocss/tree/main/examples/vite-preact) directory  using both plugins, check the scripts on `package.json` and its Vite configuration file.

### Svelte

You must add the plugin before `@sveltejs/vite-plugin-svelte`.

To support `class:foo` and `class:foo={bar}` add the plugin and configure `extractorSvelte` on `extractors` option.

You can use simple rules with `class:`, for example `class:bg-red-500={foo}` or using `shorcuts` to include multiples rules, see `src/App.svelte` on linked example project below.

```ts
// vite.config.js
import { svelte } from '@sveltejs/vite-plugin-svelte'
import Unocss from 'unocss/vite'
import { extractorSvelte } from '@unocss/core'

export default {
  plugins: [
    Unocss({
      extractors: [extractorSvelte],
      /* more options */
    }),
    svelte(),
  ],
}
```

You have a `Vite + Svelte` example project on [examples/vite-svelte](https://github.com/unocss/unocss/tree/main/examples/vite-svelte) directory.

###  Sveltekit

To support `class:foo` and `class:foo={bar}` add the plugin and configure `extractorSvelte` on `extractors` option.

You can use simple rules with `class:`, for example `class:bg-red-500={foo}` or using `shorcuts` to include multiples rules, see `src/routes/__layout.svelte` on linked example project below.

```ts
// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite'
import UnoCss from 'unocss/vite'
import { extractorSvelte } from '@unocss/core'

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [
    sveltekit(),
    UnoCss({
      extractors: [extractorSvelte],
      /* more options */
    }),
  ],
}
```

You have a `SvelteKit` example project on [examples/sveltekit](https://github.com/unocss/unocss/tree/main/examples/sveltekit) directory.

### Web Components

To work with web components you need to enable `shadow-dom` mode on the plugin.

Don't forget to remove the import for `uno.css` since the `shadow-dom` mode will not expose it and the application will not work.

```ts
// vite.config.js
import Unocss from 'unocss/vite'

export default {
  plugins: [
    Unocss({
      mode: 'shadow-dom',
      /* more options */
    }),
  ],
}
```

On each `web component` just add `@unocss-placeholder` to its style css block:
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
import Unocss from 'unocss/vite'

export default {
  plugins: [
    Unocss({
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

### Solid

**WARNING**: You should import the `uno.css` virtual module using `import 'virtual:uno.css'` instead `import 'uno.css'`. When you start the dev server first time, you'll need to update some style module to get it working (we're trying to fix it).

```ts
// vite.config.js
import solidPlugin from 'vite-plugin-solid'
import Unocss from 'unocss/vite'

export default {
  plugins: [
    solidPlugin(),
    Unocss({
      /* options */
    }),
  ],
}
```

You have a `Vite + Solid` example project on [examples/vite-solid](https://github.com/unocss/unocss/tree/main/examples/vite-solid) directory.

### Elm

You need to add the `vite-plugin-elm` plugin before UnoCSS's plugin.

```ts
// vite.config.js
import { defineConfig } from 'vite'
import elmPlugin from 'vite-plugin-elm'
import Unocss from 'unocss/vite'

export default defineConfig({
  plugins: [
    elmPlugin(),
    Unocss({
      /* options */
    }),
  ],
})
```

You have a `Vite + Elm` example project on [examples/vite-elm](https://github.com/unocss/unocss/tree/main/examples/vite-elm) directory.

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
