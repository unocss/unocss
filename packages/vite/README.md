# @unocss/vite

The Vite plugin for UnoCSS. Ships with the `unocss` package.

> This plugin does not come with any default presets. You are building a meta framework on top of UnoCSS, see [this file](https://github.com/antfu/unocss/blob/main/packages/unocss/src/vite.ts) for an example to bind the default presets.

## Installation

```bash
npm i -D unocss
```

```ts
// vite.config.ts
import Unocss from 'unocss/vite'

export default {
  plugins: [
    Unocss({ /* options */ })
  ]
}
```

Add `uno.css` to your main entry:

```ts
// main.ts
import 'uno.css'
```

## Modes

The Vite plugin comes with a set of modes that enable different behaviors.

### global (default)

This is the default mode for the plugin: in this mode you need to add the import of `uno.css` on your entry point.

This mode enables a set of Vite plugins for `build` and for `dev` with `HMR` support.

The generated `css` will be a global stylesheet injected on the `index.html`.

### vue-scoped (WIP)

This mode will inject generated CSS to Vue SFC's `<style scoped>` for isolation.

### per-module (WIP)

This mode will generate a CSS sheet for each module, can be scoped.

### dist-chunk (WIP)

This mode will generate a CSS sheet for each code chunk on build, great for MPA.

### shadow-dom

Since `Web Components` uses `Shadow DOM`, there is no way to style content directly from a global stylesheet (unless you use `custom css vars`, those will penetrate the `Shadow DOM`), you need to inline the generated css by the plugin into the `Shadow DOM` style.

To inline the generated css, you only need to configure the plugin mode to `shadow-dom` and include `@unocss-placeholder` magic placeholder on each web component style css block.

## Frameworks

Some UI/App frameworks have some caveats that must be fixed to make it work, if you're using one of the following frameworks, just apply the suggestions.

### React (WIP)

You must add the plugin before `@vitejs/plugin-react`.

If you are using `@unocss/preset-attributify`, you should remove `tsc` from the `build` script.

```ts
// vite.config.js
import react from '@vitejs/plugin-react'
import Unocss from 'unocss/vite'

export default {
  plugins: [
    Unocss({
      /* options */
    }),
    react()
  ]
}
```

### Preact (WIP)

You must add the plugin before `@preact/preset-vite`.

If you are using `@unocss/preset-attributify`, you should remove `tsc` from the `build` script.

```ts
// vite.config.js
import preact from '@preact/preset-vite'
import Unocss from 'unocss/vite'

export default {
  plugins: [
    Unocss({
      /* options */
    }),
    preact()
  ]
}
```

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
  ]
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
  ...
}
```

#### `::part` built-in support

You can use `::part` since the plugin supports it via `shortcuts` and using `part-[<part-name>]:<shortcut>` rule from `preset-mini`.

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
  ]
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

### Svelte

You must add the plugin before `@sveltejs/vite-plugin-svelte`.

To support `class:foo` and `class:foo={bar}` add the plugin and configure `extractorSvelte` on `extractors` option:

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
    svelte()
  ]
}
```

###  Sveltekit

To support `class:foo` and `class:foo={bar}` add the plugin and configure `extractorSvelte` on `extractors` option:

```ts
// svelte.config.js
import preprocess from 'svelte-preprocess'
import UnoCss from 'unocss/vite'
import { extractorSvelte } from '@unocss/core'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),

  kit: {

    // hydrate the <div id="svelte"> element in src/app.html
    target: '#svelte',
    vite: {
      plugins: [
        UnoCss({
          extractors: [extractorSvelte],
          /* more options */
        })
      ]
    }
  }
}  
```

### Solid

`WIP`: coming soon.

## License

MIT License © 2021-PRESENT [Anthony Fu](https://github.com/antfu)
