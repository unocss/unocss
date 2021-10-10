# UnoCSS

###### *Re-imaging Atomic-CSS*

[![NPM version](https://img.shields.io/npm/v/unocss?color=a1b858&label=)](https://www.npmjs.com/package/unocss)

An instant on-demand Atomic-CSS engine.

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

- No parsing, no AST, it's **INSTANT** (500x faster than Windi CSS or Tailwind JIT)
- Fully customizable - no core utilities, all functionalities are provided via presets.
- No preflights - no global pollutions.
- No pre-scanning, no file watcher - all done in one pass.
- Code-splitting for CSS - great for MPA.
- CSS Scoping.
- [Windi CSS Attributify Mode](#attributify-mode).
- [Windi CSS Shortcuts](https://windicss.org/features/shortcuts.html).
- Library friendly - ships atomic styles with your component libraries and safely scoped.

###### Non-goal

UnoCSS is designed **NOT** to be/have:

- Align / compatible with Tailwind / Windi CSS.
- A CSS preprocessor (`@apply` etc.)
- Tailwind's plugin system (but you can write custom rules in seconds and share them as presets!)
- Integrations for Webpack or others (it's Vite only).

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

## Configrations

UnoCSS is an atomic-CSS engine instead of a framework. Everything is designed with flexibility and performance in mind. In UnoCSS, there are no core utilities, all functionalities are provided via presets. By default, UnoCSS applies a default preset with a common superset of the popular utilities-first framework, including Tailwind CSS, Windi CSS, Bootstrap, Tachyons, etc.

For example, both `ml-3` (Tailwind), `ms-2` (Bootstrap), `ma4` (Tachyons), `mt-10px` (Windi CSS) are valid.

```css
.ma4 { margin: 1rem; }
.ml-3 { margin-left: 0.75rem; }
.ms-2 { margin-inline-start: 0.5rem; }
.mt-10px { margin-top: 10px; }
```

[Learn more](./packages/preset-uno).

### Presets

Presets are the heart of UnoCSS that let you make your own custom framework in mintues. We are providing the following presets officially:

- [@unocss/preset-uno](./packages/preset-uno) - The default preset.
- [@unocss/preset-attributify](./packages/preset-attributify) - Provides [Attributify Mode](#attributify-mode) to other presets and rules.
- [@unocss/preset-wind](./presets/preset-wind) - [WIP] Rules that compatible with Tailwind and Windi CSS.

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

With the code above, the following usage will be generated

```html
<div class="m-100">
  <button class="m-3">
    <icon class="p-5" />
    My Button
  </button>
</div>
```

the corresponsing CSS:

```css
.m-100 { margin: 25rem; }
.m-3 { margin: 0.75rem; }
.p-5 { padding: 1.25rem; }
```

Congratulations! Now you got your own powerful atomic-css utilities, enjoy!

### Shortcuts

// TODO:

### Style Reseting

// TODO:

### Custom Variants

[Variants](https://windicss.org/utilities/variants.html#variants) allows your to apply some variations to your existing rules. For example, to implement the `hover:` variant from Tailwind:

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

- `match` controls when the variant is enabled, if the return value is a string, it will be used as the selector for matching the rules.
- `selector` provides the availability customizing the generated CSS selector.

Let's have a tour of what happened when matching for `hover:m-2`:

- `hover:m-2` is extracted from users usages
- `hover:m-2` send to all variants for matching
- `hover:m-2` is matched by our variant, and returns `m-2`
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

### Excluding Rules

// TODO:

## Attributify Mode

[Windi CSS's Attributify Mode](https://windicss.org/posts/v30.html#attributify-mode) is one of the most beloved features. Basically, it allows you to separate and then group your utils in attributes.

Imagine you have this button using Tailwind's utilities. When the list gets long, it becomes really hard to read and maintain.

```html
<button class="bg-blue-400 hover:bg-blue-500 text-sm text-white font-mono font-light py-2 px-4 rounded border-2 border-blue-200 dark:bg-blue-500 dark:hover:bg-blue-600">
  Button
</button>
```

With attributify mode, you can separate utilities into attributes:

```html
<button 
	bg="blue-400 hover:blue-500 dark:blue-500 dark:hover:blue-600"
  text="sm white"
  font="mono light"
  p="y-2 x-4"
  border="2 rounded blue-200"
>
  Button
</button>
```

For example, `text-sm text-white` could be grouped into `test="sm white"` without duplicating the same prefix.

In UnoCSS, we also implemented this feature as the `attributify` preset that will make the attributify mode work for your custom rules with almost zero effort.

```ts
// vite.config.ts
import Unocss from 'unocss/vite'
import { presetUno, presetAttributify } from 'unocss'

export default {
  plugins: [
    Unocss({
      presets: [
        // specific presets to enable attributify mode
        presetAttributify(),
        // the default preset
        presetUno(),
      ]
    })
  ]
}
```

Intestinally, the magic of attributify mode is done by only [one variant](./packages/preset-attributify/src/variant.ts) and [one extractor](./packages/preset-attributify/src/extractor.ts) - in a total of only ~50 lines of code! This is could also be a showcase of how powerful and flexible UnoCSS is.

###### Valueless Attributify

In addition to Windi CSS's Attributify Mode, UnoCSS also supports valueless attributes.

For example, 

```html
<div class="m-2 rounded text-teal-400" />
```

now can be

```html
<div m-2 rounded text-teal-400 />
```

[Learn More](./packages/preset-attributify)

## Use Icons

// TODO:

## Make a Custom Preset

// TODO:

### Extractors

// TODO:

### Publish

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
