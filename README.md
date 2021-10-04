# unocss

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
- [Windi CSS Attributify Mode](https://windicss.org/posts/v30.html#attributify-mode).
- [Windi CSS Shortcuts](https://windicss.org/features/shortcuts.html).
- Library friendly - ships atomic styles with your component libraries and safely scoped.

###### Non-goal

`unocss` is designed **NOT** to be/have:

- Align / compatible with Tailwind / Windi CSS.
- A CSS preprocessor (`@apply` etc.)
- Tailwind's plugin system (but you can write custom rules in seconds and share them as presets!)
- Integrations for Webpack or others (it's Vite only).

###### Disclamier

> 🧪 This package is trying to explore the possibilities of what an atomic CSS framework can be. **Not production ready**, yet. Breaking changes and overhaul redesigns happen frequently.

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

## Acknowledgement

- [Atomic CSS](https://acss.io/)
- [Bootstrap Utilities](https://getbootstrap.com/docs/5.1/utilities/flex/)
- [Chakra UI Style Props](https://chakra-ui.com/docs/features/style-props)
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

## License

[MIT](./LICENSE) License © 2021 [Anthony Fu](https://github.com/antfu)
