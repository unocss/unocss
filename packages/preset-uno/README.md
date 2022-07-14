# @unocss/preset-uno

The default preset for [UnoCSS](https://github.com/unocss/unocss).

> This preset inherits
> - [@unocss/preset-wind](https://github.com/antfu/unocss/tree/main/packages/preset-wind)
> - [@unocss/preset-mini](https://github.com/antfu/unocss/tree/main/packages/preset-mini)

## Installation

```bash
npm i -D @unocss/preset-uno
```

```ts
import presetUno from '@unocss/preset-uno'

Unocss({
  presets: [
    presetUno(),
  ],
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

For more details about the default preset, you can check out our [playground](https://uno.antfu.me/play/) and try out. Meanwhile, you can also check out [the implementations](https://github.com/unocss/unocss/tree/main/packages).

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
