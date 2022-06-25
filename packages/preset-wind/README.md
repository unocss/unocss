# @unocss/preset-wind

Tailwind / Windi CSS compact preset for [UnoCSS](https://github.com/unocss/unocss).

> This preset inherits
> - [@unocss/preset-mini](https://github.com/antfu/unocss/tree/main/packages/preset-mini)

## Installation

```bash
npm i -D @unocss/preset-wind
```

```ts
import presetWind from '@unocss/preset-wind'

Unocss({
  presets: [
    presetWind(),
  ],
})
```

## Differences from Windi CSS

### `<sm` `@lg` Variants

- `<sm:p-1` -> `lt-sm:p-1`
- `@lg:p-1` -> `at-lg:p-1`
- `>xl:p-1` -> `gt-lg:p-1`

to have more consistent naming.

### Bracket Syntax Spaces

This preset uses `_` instead of `,` for respecting space in bracket syntax.

- `grid-cols-[1fr,10px,max-content]` -> `grid-cols-[1fr_10px_max-content]`

since some CSS rules require `,` as parts of the value, e.g. `grid-cols-[repeat(3,auto)]`

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
