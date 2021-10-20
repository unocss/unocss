# UnoCSS

[![NPM version](https://img.shields.io/npm/v/unocss?color=a1b858&label=)](https://www.npmjs.com/package/unocss)

The instant on-demand Atomic CSS engine.

[Online Playground](https://unocss.antfu.me/)

---

```
10/4/2021, 11:32:11 PM
1608 utilities | x50 runs

none                             10.48 ms / delta.      0.00 ms 
unocss       v0.0.0              12.46 ms / delta.      1.98 ms (x1.00)
windicss     v3.1.8             885.20 ms / delta.    874.72 ms (x441.91)
tailwindcss  v3.0.0-alpha.1    1044.62 ms / delta.   1034.14 ms (x522.45)
```

---

Inspired by [Windi CSS](http://windicss.org/), [Tailwind CSS](https://tailwindcss.com/), [Twind](https://github.com/tw-in-js/twind) but:

- No parsing, no AST, no scanning, it's **INSTANT** (500x faster than Windi CSS or Tailwind JIT)
- [Fully customizable](#configurations) - no core utilities, all functionalities are provided via presets.
- [Shortcuts](#shortcuts) - aliasing utilities, dynamically.
- [Attributify Mode](./packages/preset-attributify/) - group utilities in attributes
- [CSS Icons](./packages/preset-icons/) - use any icon as a single class.
- Code-splitting for CSS - ships minimal CSS for MPA.
- [CSS Scoping](#css-scoping)
- Library friendly - ships atomic styles with your component libraries and safely scoped.

###### Non-goal

UnoCSS is designed **NOT** to be/have:

- Align with Tailwind - technically, UnoCSS is flexible enough to do that, but it's not a priority.
- A CSS preprocessor (e.g. `@apply`) - but you can use [shortcuts](#shortcuts).
- Tailwind's plugin system - but you can write custom rules in seconds and share them as presets!
- Integrations for Webpack or others - it's Vite only.

###### Disclamier

> 🧪 This package is trying to explore the possibilities of what an atomic CSS framework can be. **Not production-ready**, yet. Breaking changes and overhaul redesigns happen frequently.

## Installation

```bash
npm i -D unocss
```

```ts
// vite.config.ts
import Unocss from 'unocss/vite'

export default {
  plugins: [
    Unocss()
  ]
}
```

That's it, have fun.

## Configurations

UnoCSS is an atomic-CSS engine instead of a framework. Everything is designed with flexibility and performance in mind. In UnoCSS, there are no core utilities; all functionalities are provided via presets.

By default, UnoCSS applies [the default preset](./packages/preset-uno). Which provides a common superset of the popular utilities-first framework, including Tailwind CSS, Windi CSS, Bootstrap, Tachyons, etc.

For example, both `ml-3` (Tailwind), `ms-2` (Bootstrap), `ma4` (Tachyons), `mt-10px` (Windi CSS) are valid.

```css
.ma4 { margin: 1rem; }
.ml-3 { margin-left: 0.75rem; }
.ms-2 { margin-inline-start: 0.5rem; }
.mt-10px { margin-top: 10px; }
```

[Learn more about the default preset](./packages/preset-uno).

### Presets

Presets are the heart of UnoCSS that let you make your own custom framework in mintues. We are providing the following presets officially:

- [@unocss/preset-uno](./packages/preset-uno) - The default preset.
- [@unocss/preset-attributify](./packages/preset-attributify) - Provides [Attributify Mode](#attributify-mode) to other presets and rules.
- [@unocss/preset-icons](./packages/preset-icons) - Use any icon as a class utility.

To set presets to your project:

```ts
// vite.config.ts
import Unocss from 'unocss/vite'
import { presetUno, presetAttributify, presetWind } from 'unocss'

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
  [/^m-(\d)$/, ([, d]) => ({ margin: `${d / 4}rem` })],
  [/^p-(\d)$/, (match) => ({ padding: `${match[1] / 4}rem` })],
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

Congratulations! Now you got your own powerful atomic-css utilities, enjoy!

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

### Custom Variants

[Variants](https://windicss.org/utilities/variants.html#variants) allows you to apply some variations to your existing rules. For example, to implement the `hover:` variant from Tailwind:

```ts
variants: [
  {
    match: s => s.startsWith('hover:') ? s.slice(6) : null,
    selector: s => `${s}:hover`,
  },
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
- finally, we apply our variants transformation to the generated CSS. In this case, we prepended `:hover` to the selector

As a result, the following CSS will be generated:

```css
.hover\:m-2:hover { margin: 0.5rem; }
```

With this, we could have `m-2` applied only when users hover over the element.

The variant system is very powerful and can't be covered fully in this guide, you can check [the default preset's implementation](./packages/preset-uno/src/variants) to see more advanced usages.

### CSS Scoping

> 🚧 This part is still under experiment. You might want to read the code to see how it works currently.

## Make a Custom Preset

// TODO:

### Extractors

// TODO:

### Publish

// TODO:

## Acknowledgement

- [Atomic CSS](https://acss.io/)
- [Bootstrap Utilities](https://getbootstrap.com/docs/5.1/utilities/flex/)
- [Chakra UI Style Props](https://chakra-ui.com/docs/features/style-props)
- [Semantic UI](https://semantic-ui.com/)
- [Tachyons](https://tachyons.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Twind](https://github.com/tw-in-js/twind)
- [Windi CSS](http://windicss.org/)

> alphabet order

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2021 [Anthony Fu](https://github.com/antfu)
