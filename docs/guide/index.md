
## What is unocss?

UnoCSS is an atomic-CSS engine instead of a framework. Everything is designed with flexibility and performance in mind. In UnoCSS, there are no core utilities; all functionalities are provided via presets.




<blockquote>



<p>💡 We highly recommend reading this blog post - <a href="https://antfu.me/posts/reimagine-atomic-css"><strong>Reimagine Atomic CSS</strong></a> for the story behind</p>
</blockquote>



## Features

Inspired by [Windi CSS](http://windicss.org/), [Tailwind CSS](https://tailwindcss.com/), [Twind](https://github.com/tw-in-js/twind) but:

- [Fully customizable](#configurations) - no core utilities, all functionalities are provided via presets.
- No parsing, no AST, no scanning, it's **INSTANT** (200x faster than Windi CSS or Tailwind JIT)
- ~3.5kb min+gzip - zero deps and browser friendly.
- [Shortcuts](#shortcuts) - aliasing utilities, dynamically.
- [Attributify Mode](https://github.com/unocss/unocss/tree/main/packages/preset-attributify/) - group utilities in attributes
- [Pure CSS Icons](https://github.com/unocss/unocss/tree/main/packages/preset-icons/) - use any icon as a single class.
- [Inspector](#inspector) - inspect and debug interatively.
- [CSS-in-JS Runtime version](https://github.com/unocss/unocss/tree/main/packages/runtime)
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

See [all packages](https://github.com/unocss/unocss/tree/main/packages).

Refer to the full documentation on [Vite](https://github.com/unocss/unocss/blob/main/packages/vite/README.md):
- modes: `global`, `dist-chunk`, `per-module`, `vue-scoped`, `svelte-scoped`, and `shadow-dom`.
- frameworks: `React`, `Preact`, `Svelte`, `SvelteKit`, `Web Components`, `Solid` and `Elm`.

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

Refer to the full documentation on https://github.com/unocss/unocss/tree/main/packages/nuxt



## Editor setup


### Vscode

  The offical [unocss vscode extension](https://marketplace.visualstudio.com/items?itemName=antfu.unocss)  provide a great experience for the editor.

  It comes by default with:

  - Decoration and tooltip for matched utilities
  - Loadls configs from `uno.config.js`, `vite.config.js` or `nuxt.config.js`
  - Count of matched utilities
