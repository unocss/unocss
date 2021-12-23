<br>

<p align="center">
<img src="https://raw.githubusercontent.com/antfu/unocss/main/playground/public/icon-gray.svg" style="width:100px;" />
</p>

<h1 align="center">UnoCSS</h1>

<p align="center">
The instant on-demand Atomic CSS engine.
</p>

<p align="center">
<a href="https://www.npmjs.com/package/unocss"><img src="https://img.shields.io/npm/v/unocss?color=c95f8b&amp;label=" alt="NPM version"></a></p>

<blockquote align="center">
<p>💡 I highly recommend reading this blog post - <br><a href="https://antfu.me/posts/reimagine-atomic-css"><strong>Reimagine Atomic CSS</strong></a><br>for the story behind</p>
</blockquote>

<br>
<p align="center"><a href="https://unocss.antfu.me/">🤹‍♂️ Online Playground</a></p>
<br>

## Features

Inspired by [Windi CSS](http://windicss.org/), [Tailwind CSS](https://tailwindcss.com/), [Twind](https://github.com/tw-in-js/twind) but:

- [Fully customizable](#configurations) - no core utilities, all functionalities are provided via presets.
- No parsing, no AST, no scanning, it's **INSTANT** (200x faster than Windi CSS or Tailwind JIT)
- ~3.5kb min+gzip - zero deps and browser friendly.
- [Shortcuts](#shortcuts) - aliasing utilities, dynamically.
- [Attributify Mode](https://github.com/antfu/unocss/tree/main/packages/preset-attributify/) - group utilities in attributes
- [Pure CSS Icons](https://github.com/antfu/unocss/tree/main/packages/preset-icons/) - use any icon as a single class.
- [Inspector](#inspector) - inspect and debug interatively.
- [CSS-in-JS Runtime version](https://github.com/antfu/unocss/tree/main/packages/runtime)
- [CSS Scoping](#css-scoping)
- [VS Code extension](https://marketplace.visualstudio.com/items?itemName=antfu.unocss)
- Code-splitting for CSS - ships minimal CSS for MPA.
- Library friendly - ships atomic styles with your component libraries and safely scoped.

###### Benchmark

```
11/5/2021, 4:26:57 AM
1656 utilities | x50 runs (min build time)

none                              8.30 ms / delta.      0.00 ms 
unocss       v0.4.15             13.58 ms / delta.      5.28 ms (x1.00)
windicss     v3.2.1             989.57 ms / delta.    981.27 ms (x185.94)
tailwindcss  v3.0.0-alpha.1    1290.96 ms / delta.   1282.66 ms (x243.05)
```

###### Non-goal

UnoCSS is designed **NOT** to be/have:

- A CSS preprocessor (e.g. `@apply`) - but you can use [shortcuts](#shortcuts).
- Tailwind's plugin system - but you can write custom rules in seconds and share them as presets!

###### Disclaimer

> 🧪 This package is trying to explore the possibilities of what an atomic CSS framework can be. **Not production-ready**, yet. Expect breaking changes and overhaul redesigns.

## Installation

### Vite

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

That's it, have fun.

See [all packages](https://github.com/antfu/unocss/tree/main/packages).

Refer to the full documentation on [Vite](https://github.com/antfu/unocss/blob/main/packages/vite/README.md): 
- modes: `global`, `dist-chunk`, `per-module`, `vue-scoped`, and `shadow-dom`.
- frameworks: `React`, `Preact`, `WebComponents`, `Svelte`, `Sveltekit` and `Solid`.

### Nuxt

```bash
npm i -D @unocss/nuxt
```

```ts
// nuxt.config.js

export default {
  buildModules: [
    '@unocss/nuxt'
  ]
}
```

Refer to the full documentation on https://github.com/antfu/unocss/tree/main/packages/nuxt

## Configurations

UnoCSS is an atomic-CSS engine instead of a framework. Everything is designed with flexibility and performance in mind. In UnoCSS, there are no core utilities; all functionalities are provided via presets.

By default, UnoCSS applies [the default preset](https://github.com/antfu/unocss/tree/main/packages/preset-uno). Which provides a common superset of the popular utilities-first framework, including Tailwind CSS, Windi CSS, Bootstrap, Tachyons, etc.

For example, both `ml-3` (Tailwind), `ms-2` (Bootstrap), `ma4` (Tachyons), `mt-10px` (Windi CSS) are valid.

```css
.ma4 { margin: 1rem; }
.ml-3 { margin-left: 0.75rem; }
.ms-2 { margin-inline-start: 0.5rem; }
.mt-10px { margin-top: 10px; }
```

[Learn more about the default preset](https://github.com/antfu/unocss/tree/main/packages/preset-uno).

### Presets

Presets are the heart of UnoCSS that lets you make your own custom framework in minutes.

###### Official Presets

- [@unocss/preset-uno](https://github.com/antfu/unocss/tree/main/packages/preset-uno) - The default preset.
- [@unocss/preset-attributify](https://github.com/antfu/unocss/tree/main/packages/preset-attributify) - Provides [Attributify Mode](https://github.com/antfu/unocss/tree/main/packages/preset-attributify#attributify-mode) to other presets and rules.
- [@unocss/preset-icons](https://github.com/antfu/unocss/tree/main/packages/preset-icons) - Use any icon as a class utility.

###### Community Presets

- [unocss-preset-typography](https://github.com/ydcjeff/unocss-preset-typography) - Typography Preset by [@ydcjeff](https://github.com/ydcjeff)

### Use Presets

To set presets to your project:

```ts
// vite.config.ts
import Unocss from 'unocss/vite'
import { presetUno, presetAttributify } from 'unocss'

export default {
  plugins: [
    Unocss({
      presets: [
        presetAttributify({ /* preset options */}),
        presetUno(),
        // ...custom presets
      ]
    })
  ]
}
```

When the `presets` option is specified, the default preset will be ignored.

To disable the default preset, you can set `presets` to an empty array:

```ts
// vite.config.ts
import Unocss from 'unocss/vite'

export default {
  plugins: [
    Unocss({
      presets: [], // disable default preset
      rules: [
        // your custom rules
      ]
    })
  ]
}
```

### Custom Rules

###### Static Rules

Writing custom rules for UnoCSS is super easy. For example:

```ts
rules: [
  ['m-1', { margin: '0.25rem' }]
]
```

You will have the following CSS generated whenever `m-1` is detected in users' codebase:

```css
.m-1 { margin: 0.25rem; }
```

###### Dynamic Rules

To make it smarter, change the matcher to a RegExp and the body to a function:

```ts
rules: [
  [/^m-(\d+)$/, ([, d]) => ({ margin: `${d / 4}rem` })],
  [/^p-(\d+)$/, (match) => ({ padding: `${match[1] / 4}rem` })],
]
```

The first argument of the body function is the match result, you can destructure it to get the matched groups.

For example, with the following usage:

```html
<div class="m-100">
  <button class="m-3">
    <icon class="p-5" />
    My Button
  </button>
</div>
```

the corresponding CSS will be generated:

```css
.m-100 { margin: 25rem; }
.m-3 { margin: 0.75rem; }
.p-5 { padding: 1.25rem; }
```

Congratulations! Now you got your own powerful atomic CSS utilities, enjoy!

###### Full Controlled Rules

<details>
<summary>This is an advance feature, you don't need it in most of the cases.</summary>

<br>

When you really need some advanced rules that can't be covered by the combination of [Dynamic Rules](#dynamic-rules) and [Variants](#custom-variants), you also provide a way to give you full controls of generating the CSS.

By returning a `string` from the dynamic rule's body function, it will be directly passed to the generated CSS. That also means you would need to take care of things like CSS escaping, variants applying, CSS constructing, and so on.

```ts
import Unocss, { escape as e } from 'unocss'

Unocss({
  rules: [
    [/^custom-(.+)$/, ([, name], { rawSelector, currentSelector, variantHandlers, theme }) => {
      // discard mismatched rules
      if (name.includes('something'))
        return

      // if you want, you can disable the variants for this rule
      if (variantHandlers.length)
        return

      // return a string instead of an object
      return `
.${e(rawSelector)} {
  font-size: ${theme.fontSize.sm};
}
/* you can have multiple rules */
.${e(rawSelector)}::after {
  content: 'after';
}
.foo > .${e(rawSelector)} {
  color: red;
}
/* or media queries */
@media (min-width: ${theme.breakpoints.sm}) {
  .${e(rawSelector)} {
    font-size: ${theme.fontSize.sm};
  }
}
`
    }]
  ]
})
```

You might need to read some code to take the full power of it.

</details>

### Ordering

UnoCSS keeps the order of the rules you defined to the generated CSS. Later ones come with higher priority.

### Shortcuts

UnoCSS provides the shortcuts functionality that is similar to [Windi CSS's](https://windicss.org/features/shortcuts.html)

```ts
shortcuts: {
  // shortcuts to multiple utilities
  'btn': 'py-2 px-4 font-semibold rounded-lg shadow-md',
  'btn-green': 'text-white bg-green-500 hover:bg-green-700',
  // single utility alias
  'red': 'text-red-100'
}
```

In addition to the plain mapping, UnoCSS also allows you to define dynamic shortcuts.

Similar to [Rules](#custom-rules), a dynamic shortcut is the combination of a matcher RegExp and a handler function.

```ts
shortcuts: [
  // you could still have object style
  {
    'btn': 'py-2 px-4 font-semibold rounded-lg shadow-md',
  },
  // dynamic shortcuts
  [/^btn-(.*)$/, ([, c]) => `bg-${c}-400 text-${c}-100 py-2 px-4 rounded-lg`],
]
```

With this, we could use `btn-green` and `btn-red` to generate the following CSS:

```css
.btn-green {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  --un-bg-opacity: 1;
  background-color: rgba(74, 222, 128, var(--un-bg-opacity));
  border-radius: 0.5rem;
  --un-text-opacity: 1;
  color: rgba(220, 252, 231, var(--un-text-opacity));
}
.btn-red {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  --un-bg-opacity: 1;
  background-color: rgba(248, 113, 113, var(--un-bg-opacity));
  border-radius: 0.5rem;
  --un-text-opacity: 1;
  color: rgba(254, 226, 226, var(--un-text-opacity));
}
```

### Rules Merging

By default, UnoCSS will merge CSS rules with the same body to minimize the CSS size.

For example, `<div class="m-2 hover:m2">` will generate

```css
.hover\:m2:hover, .m-2 { margin: 0.5rem; }
```

instead of two separate rules:

```css
.hover\:m2:hover { margin: 0.5rem; }
.m-2 { margin: 0.5rem; }
```

### Style Resetting

UnoCSS does not provide style resetting or preflight by default for maximum flexibility and does not populate your global CSS. If you use UnoCSS along with other CSS frameworks, they probably already do the resetting for you. If you use UnoCSS alone, you can use resetting libraries like [Normalize.css](https://necolas.github.io/normalize.css/).

We also provide a small collection for you to grab them quickly:

```bash
npm i @unocss/reset
```

```ts
// main.js
// pick one of the following

// normalize.css
import '@unocss/reset/normalize.css'
// reset.css by Eric Meyer https://meyerweb.com/eric/tools/css/reset/index.html
import '@unocss/reset/eric-meyer.css'
// preflights from tailwind
import '@unocss/reset/tailwind.css'
```

Learn more at [@unocss/reset](https://github.com/antfu/unocss/tree/main/packages/reset).

### Custom Variants

[Variants](https://windicss.org/utilities/variants.html#variants) allows you to apply some variations to your existing rules. For example, to implement the `hover:` variant from Tailwind:

```ts
variants: [
  // hover:
  (matcher) => {
    if (!matcher.startsWith('hover:'))
      return matcher
    return {
      // slice `hover:` prefix and passed to the next variants and rules
      matcher: matcher.slice(6),
      selector: s => `${s}:hover`,
    }
  }
],
rules: [
  [/^m-(\d)$/, ([, d]) => ({ margin: `${d / 4}rem` })],
]
```

- `match` controls when the variant is enabled. If the return value is a string, it will be used as the selector for matching the rules.
- `selector` provides the availability of customizing the generated CSS selector.

Let's have a tour of what happened when matching for `hover:m-2`:

- `hover:m-2` is extracted from users usages
- `hover:m-2` send to all variants for matching
- `hover:m-2` is matched by our variant and returns `m-2`
- the result `m-2` will be used for the next round of variants matching
- if no more variant is matched, `m-2` will then goes to match the rules
- our first rule get matched and generates `.m-2 { margin: 0.5rem; }`
- finally, we apply our variants transformation to the generated CSS. In this case, we prepended `:hover` to the `selector` hook

As a result, the following CSS will be generated:

```css
.hover\:m-2:hover { margin: 0.5rem; }
```

With this, we could have `m-2` applied only when users hover over the element.

The variant system is very powerful and can't be covered fully in this guide, you can check [the default preset's implementation](https://github.com/antfu/unocss/tree/main/packages/preset-uno/src/variants) to see more advanced usages.

### Extend Theme

UnoCSS also supports the theming system that you might be familiar with in Tailwind / Windi. At the user level, you can specify the `theme` property in your config and it will be deep merged to the default theme.

```ts
theme: {
  colors: {
    'very-cool': '#0000ff',
  },
  breakpoints: {
    xs: '320px',
    sm: '640px',
  }
}
```

To consume the theme in rules:

```ts
rules: [
  [/^text-(.*)$/, ([, c], { theme }) => {
    if (theme.colors[c])
      return { color: theme.colors[c] }
  }]
]
```

### Layers

The orders of CSS will affect their priorities. While we will [retain the order of rules](#ordering), sometimes you may want to group some utilities to have more explicit control of their orders.

Unlike Tailwind, which offers fixed 3 layers (`base`, `components`, `utilities`), UnoCSS allows you to define your own layers as you want. To set the layer, you can pass the metadata as the third item of your rules:

```ts
rules: [
  [/^m-(\d)$/, ([, d]) => ({ margin: `${d / 4}rem` }), { layer: 'utilities' }],
  // when you omit the layer, it will be `default`
  ['btn', { padding: '4px' }]
]
```

This will make it generates:

```css
/* layer: default */
.btn { padding: 4px; }
/* layer: utilities */
.m-2 { margin: 0.5rem; }
```

You can control the order of layers by:

```ts
layers: {
  components: -1,
  default: 1,
  utilities: 2,
  'my-layer': 3,
}
```

Layers without specified order will be sorted alphabetically.

When you want to have your custom CSS between layers, you can update your entry module:

```ts
// 'uno:[layer-name].css'
import 'uno:components.css'
// layers that are not 'components' and 'utilities' will fallback to here
import 'uno.css'
// your own CSS
import './my-custom.css'
// "utilities" layer will have the highest priority
import 'uno:utilities.css'
```

### Utilities Preprocess & Prefixing

UnoCSS also provides the ability to preprocess and transform extracted utilities before processing to the matcher. For example, the following example allows you to add a global prefix to all utilities:

```ts
preprocess(matcher) {
  return matcher.startsWith('prefix-')
    ? matcher.slice(7)
    : undefined // ignore
}
```

### Scanning

By default UnoCSS will scan for components files like: `.jsx`, `.tsx`, `.vue`, `.md`, `.html`, `.svelte`, `.astro`. 

`.js` and `.ts` files are not included by default. You can add `@unocss-include` anywhere in the file that you want UnoCSS to scan at per-file bias, or include `*.js` or `*.ts` in the configuration to make all js/ts files as scan targets.

### Inspector

From v0.7.0, our Vite plugin now ships with a dev inspector ([@unocss/inspector](https://github.com/antfu/unocss/tree/main/packages/inspector)) for you to view, play and analyse your custom rules and setup. Visit `http://localhost:3000/__unocss` in your Vite dev server to see it.

<img src="https://user-images.githubusercontent.com/11247099/140885990-1827f5ce-f12a-4ed4-9d63-e5145a65fb4a.png">

### Runtime (CSS-in-JS)

See [@unocss/runtime](https://github.com/antfu/unocss/tree/main/packages/runtime)

### CSS Scoping

> 🚧 This part is still under experiment. You might want to read the code to see how it works currently.

<!-- ## Make a Custom Preset

// TODO:

### Extractors

// TODO:

### Publish

// TODO: -->


## Acknowledgement

> in alphabet order

- [ACSS](https://acss.io/)
- [Bootstrap Utilities](https://getbootstrap.com/docs/5.1/utilities/flex/)
- [Chakra UI Style Props](https://chakra-ui.com/docs/features/style-props)
- [Semantic UI](https://semantic-ui.com/)
- [Tachyons](https://tachyons.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Twind](https://github.com/tw-in-js/twind)
- [Windi CSS](http://windicss.org/)

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## Project Activity

![Alt](https://repobeats.axiom.co/api/embed/00d8bcc7f3651c0f0cccf9228f5776fb111ab478.svg "Repobeats analytics image")

## License

[MIT](./LICENSE) License © 2021 [Anthony Fu](https://github.com/antfu)
