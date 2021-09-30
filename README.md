# miniwind

[![NPM version](https://img.shields.io/npm/v/miniwind?color=a1b858&label=)](https://www.npmjs.com/package/miniwind)

Crazy fast and lightweight on-demand atomic CSS framework.

Inspired by [Windi CSS](http://windicss.org/), [Tailwind CSS](https://tailwindcss.com/), [Twind](https://github.com/tw-in-js/twind) but:

- No parsing, no AST, crazy fast.
- Component/Module level CSS instead of global - CSS code-splitting!
- Fully customizable - no core utilities, only presets.
- No preflights.
- Instant HMR.
- No pre-scanning, no file watcher - all done in one pass.

###### Non-goal

`miniwind` is designed **NOT** to be:

- Align with Tailwind or Windi CSS.
- CSS preprocessor (`@apply` etc.)
- Plugins for Webpack or others (it's Vite only).

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2021 [Anthony Fu](https://github.com/antfu)
