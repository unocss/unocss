# miniwind

###### *Re-imaging Atomic-CSS*

[![NPM version](https://img.shields.io/npm/v/miniwind?color=a1b858&label=)](https://www.npmjs.com/package/miniwind)


An instant on-demand Atomic-CSS engine.

---

```
10/3/2021, 4:13:34 PM
1344 utilities | x50 runs

none                           5.62 ms / delta.   0.00 ms 
miniwind                       6.25 ms / delta.   0.63 ms (x1)
windicss     v3.1.8          550.73 ms / delta. 545.11 ms (x866.97)
tailwind-jit v3.0.0-alpha.1  608.88 ms / delta. 603.26 ms (x959.46)
```

---

Inspired by [Windi CSS](http://windicss.org/), [Tailwind CSS](https://tailwindcss.com/), [Twind](https://github.com/tw-in-js/twind) but:

- No parsing, no AST, it's **INSTANT** (800x faster than Windi CSS or Tailwind JIT)
- Fully customizable - no core utilities, all functionalities are provided via presets.
- No preflights - no global pollutions.
- No pre-scanning, no file watcher - all done in one pass.
- Code-splitting for CSS - great for MPA.
- CSS Scoping.
- Windi CSS [Attributify Mode](https://windicss.org/posts/v30.html#attributify-mode).
- Windi CSS [Shortcuts](https://windicss.org/features/shortcuts.html).
- Library friendly - ships atomic styles with your component libraries and safely scoped.

###### Non-goal

`miniwind` is designed **NOT** to be/have:

- Align / compatible with Tailwind or Windi CSS.
- A CSS preprocessor (`@apply` etc.)
- Tailwind's plugin system (but you can write custom rules in seconds and share them as presets!)
- Integrations for Webpack or others (it's Vite only).

###### Disclamier

> 🧪 This package is trying to explore the possibilities of what an atomic CSS framework can be. **Not production ready**, yet. Breaking changes and overhaul redesigns happen frequently.

## Installation

```bash
npm i -D miniwind
```

```ts
// vite.config.ts
import Miniwind from 'miniwind/vite'

export default {
  plugins: [
    Miniwind()
  ]
}
```

That's it, have fun.

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2021 [Anthony Fu](https://github.com/antfu)
