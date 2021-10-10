# @unocss/preset-uno

The default preset for [UnoCSS](https://github.com/antfu/unocss).

> Please note that this preset is more like a playground at the current stage to experiment with the possibility of UnoCSS and as also a reference for making a custom preset. It does NOT follow semver and subjects to changes without further notice. We don't recommend using it on serious works. Use custom rules instead to ensure a stable outcome.

## Installation

```bash
npm i -D @unocss/preset-uno
```

```ts
import presetUno from '@unocss/preset-uno'

Unocss({
  presets: [
    presetUno({ /* options */ })
  ]
})
```

## Usages

This preset is trying to provide a common superset of the popular utilities-first framework, including Tailwind CSS, Windi CSS, Bootstrap, Tachyons, etc.

For example, both `ml-3` (Tailwind), `ms-2` (Bootstrap), `ma4` (Tachyons), `mt-10px` (Windi CSS) are valid.

```css
.ma4 { margin: 1rem; }
.ml-3 { margin-left: 0.75rem; }
.ms-2 { margin-inline-start: 0.5rem; }
.mt-10px { margin-top: 10px; }
```

For more details about the default preset, you can check out our [playground](https://unocss-play.antfu.me) and try out. Meanwhile, you can also check out [the implementation](./src/rules).

## License

MIT License © 2021-PRESENT [Anthony Fu](https://github.com/antfu)
