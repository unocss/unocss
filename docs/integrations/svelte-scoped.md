---
title: UnoCSS Svelte Scoped
description: Svelte Scoped Vite Plugin and Svelte Preprocessor for UnoCSS.
outline: deep
---

# Svelte Scoped

Place generated CSS for each Svelte component's utility styles directly into the Svelte component's `<style>` block instead of in a global CSS file. 

This component:

```svelte
<div class="mb-1" />
```

is transformed into:

```svelte
<div class="uno-ei382o" />

<style>
  :global(.uno-ei382o) {
    margin-bottom: 0.25rem;
  }
</style>
```


## When to Use

| Use Case | | Description | Package to Use |
| --- | --- | --- | --- |
| Smaller apps | :x: | Having 1 global CSS file is more convenient. Use the regular Vite plugin for [Svelte](/integrations/vite#svelte)/[SvelteKit](/integrations/vite#sveltekit). | [unocss/vite](/integrations/vite#svelte) |
| Larger apps | ✅ | Svelte Scoped can help you avoid an ever-growing global CSS file. | [@unocss/svelte-scoped/vite](#vite-plugin) |
| Component library | ✅ | Generated styles are placed directly in built components without the need to use UnoCSS in a consuming app's build pipeline. | [@unocss/svelte-scoped/preprocess](#svelte-preprocessor) |

## Vite Plugin

In Svelte or SvelteKit apps, inject generated styles directly into your Svelte components, while only placing the bare minimum necessary styles in a global stylesheet. Check out the [SvelteKit example](https://github.com/unocss/unocss/tree/main/examples/sveltekit-scoped) in Stackblitz:

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/fork/github/unocss/unocss/tree/main/examples/sveltekit-scoped)


### Install

::: code-group
  ```bash [pnpm]
  pnpm add -D unocss @unocss/svelte-scoped
  ```
  ```bash [yarn]
  yarn add -D unocss @unocss/svelte-scoped
  ```
  ```bash [npm]
  npm install -D unocss @unocss/svelte-scoped
  ```
:::

#### Add plugin

Add `@unocss/svelte-scoped/vite` to your Vite config:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import UnoCSS from '@unocss/svelte-scoped/vite'

export default defineConfig({
  plugins: [
    UnoCSS({
      // injectReset: '@unocss/reset/normalize.css', // see type definition for all included reset options or how to pass in your own
      // ...other Svelte Scoped options
    }),
    sveltekit(),
  ],
})
```

#### Add config file

Setup your `uno.config.ts` file as described [below](#configuration).

#### Global styles

While almost all styles are placed into individual components, there are still a few that must be placed into a global stylesheet: preflights, safelist, and an optional reset (if you use the `injectReset` option).

Add the `%unocss-svelte-scoped.global%` placeholder into your `<head>` tag. In Svelte this is `index.html`. In SvelteKit this will be in `app.html` before `%sveltekit.head%`:

```html
<head>
  <!-- ... -->
  <title>SvelteKit using UnoCSS Svelte Scoped</title>
  %unocss-svelte-scoped.global%
  %sveltekit.head%
</head>
```

If using SvelteKit, you also must add the following to the `transformPageChunk` hook in your `server.hooks.js` file:

```js
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%unocss-svelte-scoped.global%', 'unocss_svelte_scoped_global_styles'),
  })
  return response
}
```

*In a regular Svelte project, Vite's `transformIndexHtml` hook will do this automatically.*


## Svelte Preprocessor

Use utility styles to build a component library that is not dependent on including a companion CSS file by using a preprocessor to place generated styles directly into built components. Check out the [SvelteKit Library example](https://github.com/unocss/unocss/tree/main/examples/sveltekit-preprocess) in Stackblitz:

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/fork/github/unocss/unocss/tree/main/examples/sveltekit-preprocess)

### Install

::: code-group
  ```bash [pnpm]
  pnpm add -D unocss @unocss/svelte-scoped
  ```
  ```bash [yarn]
  yarn add -D unocss @unocss/svelte-scoped
  ```
  ```bash [npm]
  npm install -D unocss @unocss/svelte-scoped
  ```
:::

#### Add preprocessor

Add `@unocss/svelte-scoped/preprocess` to your Svelte config:

```ts
// svelte.config.js
import adapter from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/kit/vite'
import UnoCSS from '@unocss/svelte-scoped/preprocess'

const config = {
  preprocess: [
    vitePreprocess(),
    UnoCSS({
      // ... preprocessor options
    }),
  ],
  // other Svelte config
}
```

#### Don't Combine Class Names in Development

When using Svelte Scoped in a normal app, the Vite plugin will automatically detect `dev` vs `build`. In development, classes will be kept distinct and hashed in place for ease of toggling on/off in your browser's developer tools. `class="mb-1 mr-1"` will turn into something like `class="_mb-1_9hwi32 _mr-1_84jfy4`. In production, these will be compiled into a single class name using your desired prefix, `uno-` by default, and a hash based on the filename + class names, e.g. `class="uno-84dke3`.

If you want this same behavior when using the preprocessor, you must manually set the the `combine` option based on environemnt. One way to do this is to install [cross-env](https://www.npmjs.com/package/cross-env) and update your dev script to this:

```
"dev": "cross-env NODE_ENV=development vite dev",
```

Then adjust your svelte.config.js:

```diff
+const prod = process.env.NODE_ENV !== 'development'
const config = {
  preprocess: [
    vitePreprocess(),
    UnoCSS({
+      combine: prod,
    }),
  ],
}
```

#### Add config file

Setup your `uno.config.ts` file as described [below](#configuration).

### Preflights & Safelist

When using Svelte Scoped as a preprocessor you have the option to include preflights/safelist classes directly in your component by adding `uno:preflights` or `uno:safelist` as a style attribute. 

```html
<style uno:preflights uno:safelist></style>
```

Adding preflights into individual components is unnecessary if your classes do not depend on preflights or your built components are being consumed only in apps that already include preflights.

## Configuration

Place your UnoCSS settings in an `uno.config.ts` file: 

```ts
// uno.config.ts
import { defineConfig } from 'unocss'

export default defineConfig({
  // ...UnoCSS options
})
```

See [Config File](/guide/config-file) and [Config reference](/config/) for more details.

::: info
Transformers and extractors are not supported due to the differences in normal UnoCSS global usage and Svelte Scoped usage.
:::


## Usage

The following methods of writing classes are supported:

- `class="mb-1 mr-1"`
- `class:mb-1={condition}`
- `class:logo` (both the class and condition have the same name)

### Context dependent classes

Svelte Scoped will automatically compile class names to a unique name based on class name(s) + component name and then add a `:global()` wrapper which keeps the Svelte compiler from stripping them out and allows classes to have global influence without style conflicts.

#### Parent dependent

Classes that depend on attributes found in a parent component:

```svelte
<div class="dark:mb-2 rtl:right-0"></div>
```

turn into:

```svelte
<div class="uno-3hashz"></div>

<style>
  :global(.dark .uno-3hashz) {
    margin-bottom: 0.5rem;
  }
  :global([dir="rtl"] .uno-3hashz) {
    right: 0rem;
  }
</style>
```

#### Children influencing

You can add space between 3 children elements of which some are in separate components:

```svelte
<div class="space-x-1">
  <div>Status: online</div>
  <Button>FAQ</Button>
  <Button>Login</Button>
</div>
```

turns into:

```svelte
<div class="uno-7haszz">
  <div>Status: online</div>
  <Button>FAQ</Button>
  <Button>Login</Button>
</div>

<style>
  :global(.uno-7haszz > :not([hidden]) ~ :not([hidden])) {
    --un-space-x-reverse: 0;
    margin-left: calc(0.25rem * calc(1 - var(--un-space-x-reverse)));
    margin-right: calc(0.25rem * var(--un-space-x-reverse));
  }
</style>
```

#### Passing classes to child components

You can add a `class` prop to a component to allow passing custom classes wherever that component is consumed. 

```svelte
<Button class="px-2 py-1">Login</Button>
```

turns into:

```svelte
<Button class="uno-4hshza">Login</Button>

<style>
  :global(.uno-4hshza) {
    padding-left:0.5rem;
    padding-right:0.5rem;
    padding-top:0.25rem;
    padding-bottom:0.25rem;
  }
</style>
```

An easy way to implement the class in the receiving component (`Button` in the example above) is to place them on to an element using `{$$props.class}` as in `div class="{$$props.class} foo bar" />`.

### Apply directives

You can use apply directives inside your `<style>` blocks with either `--at-apply` or `@apply` or any custom value set using the `applyVariables` option. 

Svelte Scoped even properly handles context dependent classes like `dark:text-white` that the regular [`@unocss/transformer-directives`](/transformers/directives) package can't handle properly because it wasn't built specifically for Svelte style blocks. For example, with Svelte Scoped this component:

```svelte
<div />

<style>
  div {
    --at-apply: rtl:ml-2;
  }
</style>
```

will be transformed into:

```svelte
<div />

<style>
  :global([dir=\\"rtl\\"]) div {
    margin-right: 0.5rem;
     rtl:ml-1;
  }
</style>
```

In order for `rtl:ml-2` to work properly, the `[dir="rtl"]` selector needs wrapped with `:global()` to keep the Svelte compiler from stripping it out automatically as the component has no element with that attribute. However, you don't want `div` being included in the `:global()` wrapper because that would then affect every `div` element in your entire app.

## Presets support

Do to the nature of having a few necessary styles in a global stylesheet and everything else contained in each component where needed, presets need to be handled on a case-by-case basis:

| | Supported | Notes | 
| --- | :-- | :-- | 
| Presets that only add rules/variants | ✅ | PresetUno, PresetMini, PresetWind, etc...  |
| [@unocss/preset-icons](https://github.com/unocss/unocss/tree/main/packages/preset-icons) | ✅ |  |
| [@unocss/web-fonts](https://github.com/unocss/unocss/tree/main/packages/preset-icons) | ✅ |  | 
| [@unocss/preset-typography](https://github.com/unocss/unocss/tree/main/packages/preset-typography) | ✅ | Using the `.prose` class adds a large amount of rulesets which Svelte Scoped will not properly surround with `:global()` wrappers so add the `prose` class to your safelist when using this preset. All other classes from this preset, e.g. `prose-pink`, can be component scoped. | 
| [@unocss/preset-rem-to-px](https://github.com/unocss/unocss/tree/main/packages/preset-rem-to-px) | ✅ | This and all presets like it that only modify style output will work. | 
| [@unocss/preset-attributify](https://github.com/unocss/unocss/tree/main/packages/preset-attributify) | - | Use the [unplugin-attributify-to-class](https://github.com/MellowCo/unplugin-attributify-to-class) Vite plugin, updating the include option: `attributifyToClass({ include: [/\.svelte$/]})`  |
| [@unocss/preset-tagify](https://github.com/unocss/unocss/tree/main/packages/preset-tagify) | - | Presets that add custom extractors will not work. Create a preprocessor to convert `<text-red>Hi</text-red>` to `<span class="text-red">Hi</span>`, then create a PR to add the link here. |

For other presets, if they don't rely on traditional `class="..."` usage you will need to first preprocess those class names into the `class="..."` attribute. If they add extremely complex styles like typography's `.prose` class then you may need to place the complex class names into your safelist.

## Scoped utility classes unleashes creativity

Some advice on when you might want to use scoped styles: A global css file that includes everything is great for smaller apps, but there will come a point in a large project's life when every time you start to write a class like `.md:max-w-[50vw]` that you know is only going to be used once you start to cringe as you feel the size of your global style sheet getting larger and larger. This inhibits creativity. Sure, you could use `--at-apply: md:max-w-[50vw]` in the style block but that gets tedious and styles in context are so useful. Furthermore, if you would like to include a great variety of icons in your project, you will begin to feel the weight of adding them to the global stylesheet. When each component bears the weight of its own styles and icons you can continue to expand your project without having to analyze the cost benefit of each new addition.

## License

- MIT License &copy; 2022-PRESENT [Jacob Bowdoin](https://github.com/jacob-8)
