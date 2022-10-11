# SvelteKit Component Library + @unocss/svelte-preprocess-unocss

Works the same as the UnoCSS Vite plugin's `svelte-scoped` mode except it is a Svelte preprocessor instead of a Vite plugin. This wrapper was created to enable component libraries built using `svelte-package` to still use UnoCSS.

## What does it do?

If you have a `Hello.svelte` component like this:

```html
<div class="mr-2 rtl:ml-2">Hello</div>
```

When you run the `svelte-package` command, it will be turned into this:

```html
<div class="uno-860hrb">Hello</div>

<style>
  :global(.uno-860hrb) {
    margin-right: 0.5rem;
  }
  :global([dir="rtl"] .uno-860hrb) {
    margin-bottom: 0.5rem;
  }
</style>
```

## Why?

This enables you to use components built with utility classes to be used in any project without that project needing to be responsible for the `.mr-2 .rtl:ml-2` classes. Your component libraries don't need to match the particular Uno, Windi, Tailwind setup/version of your sites. This allows for easier of upgrades of all parts of your ecosystem, because they work well together but aren't dependent on each other. You also won't need to include a global stylesheet alongside your components for them to be used properly. As well, if a particular component is never used or at least not seen in a page a user visits, those styles will never be downloaded. This allows for a component to be truly sufficient on its own and yet responsive to parent and children components. For example, in the example above, the `margin-bottom` will only apply in cases where some parent element (in the same component or in a parent component) has `dir="rtl"`.

## Installation

```bash
npm i -D unocss @unocss/svelte-preprocess-unocss
```

```ts
// svelte.config.js
import adapter from '@sveltejs/adapter-auto'
import preprocess from 'svelte-preprocess'
import UnoCSS from '@unocss/svelte-preprocess-unocss'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    preprocess(),
    UnoCSS({
      // add options,
    }),
  ],

  kit: {
    adapter: adapter(),
  },
}

export default config
```