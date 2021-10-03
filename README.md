# miniwind

[![NPM version](https://img.shields.io/npm/v/miniwind?color=a1b858&label=)](https://www.npmjs.com/package/miniwind)

**Re-imaging atomic CSS**.

An instant on-demand atomic-CSS engine.

Inspired by [Windi CSS](http://windicss.org/), [Tailwind CSS](https://tailwindcss.com/), [Twind](https://github.com/tw-in-js/twind) but:

- No parsing, no AST, it's INSTANT. (⚡️ 100x faster than Windi CSS or Tailwind JIT)
- CSS code-splitting.
- Fully customizable - no core utilities, all functionalities are provided via presets.
- No preflights - no global pollutions.
- No pre-scanning, no file watcher - all done in one pass.
- CSS Scoping.
- Windi CSS Attributify Mode.
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
