<br>

<p align="center">
<img src="https://raw.githubusercontent.com/unocss/unocss/main/playground/public/icon-gray.svg" style="width:100px;" />
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
<p align="center">
<a href="https://unocss.dev/">📚 Documentation</a> |
<a href="https://unocss.dev/interactive/">🧑‍💻 Interactive Docs</a> |
<a href="https://unocss.dev/play/">🤹‍♂️ Playground</a>
</p>
<br>

## Features

Inspired by [Windi CSS](http://windicss.org/), [Tailwind CSS](https://tailwindcss.com/), and [Twind](https://github.com/tw-in-js/twind), but:

- [Fully customizable](https://unocss.dev/config/) - no core utilities. All functionalities are provided via presets.
- No parsing, no AST, no scanning, it's **INSTANT** (5x faster than Windi CSS or Tailwind JIT).
- ~6kb min+brotli - zero deps and browser friendly.
- [Shortcuts](https://unocss.dev/config/shortcuts) - aliasing utilities, dynamically.
- [Attributify mode](https://unocss.dev/presets/attributify/) - group utilities in attributes.
- [Pure CSS Icons](https://unocss.dev/presets/icons/) - use any icon as a single class.
- [Variant Groups](https://unocss.dev/transformers/variant-group) - shorthand for group utils with common prefixes.
- [CSS Directives](https://unocss.dev/transformers/directives) - reuse utils in CSS with `@apply` directive.
- [Compilation mode](https://unocss.dev/transformers/compile-class/) - synthesizes multiple classes into one at build time.
- [Inspector](https://unocss.dev/tools/inspector) - inspect and debug interactively.
- [CSS-in-JS Runtime build](https://unocss.dev/integrations/runtime) - use UnoCSS with one line of CDN import.
- [VS Code extension](https://marketplace.visualstudio.com/items?itemName=antfu.unocss)
- Code-splitting for CSS - ships minimal CSS for MPA.

## Documentation

Read the [documentation](https://unocss.dev/) for more details.

## Installation

- [Vite](https://unocss.dev/integrations/vite)
- [Nuxt](https://unocss.dev/integrations/nuxt)
- [Astro](https://unocss.dev/integrations/astro)
- [Webpack](https://unocss.dev/integrations/webpack)
- [CDN Runtime](https://unocss.dev/integrations/runtime)
- [CLI](https://unocss.dev/integrations/cli)
- [VS Code extension](https://unocss.dev/integrations/vscode)
- [ESLint Config](https://unocss.dev/integrations/eslint)
- [PostCSS](https://unocss.dev/integrations/postcss)

## Acknowledgement

UnoCSS is made possible thanks to the inspirations from the following projects:

> in alphabetical order

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

## License

[MIT](./LICENSE) License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
