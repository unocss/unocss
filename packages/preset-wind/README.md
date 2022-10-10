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
- `>xl:p-1` -> `lg:p-1`

to have more consistent naming.

### Bracket Syntax Spaces

This preset uses `_` instead of `,` for respecting space in bracket syntax.

- `grid-cols-[1fr,10px,max-content]` -> `grid-cols-[1fr_10px_max-content]`

since some CSS rules require `,` as parts of the value, e.g. `grid-cols-[repeat(3,auto)]`

## Experimental Features

This preset includes experimental feature that may be changed in breaking ways at any time.

### Media Hover

Media hover addresses the [sticky hover](https://css-tricks.com/solving-sticky-hover-states-with-media-hover-hover/) problem where tapping target that includes hover style on mobile will persist that hover style until tapping elsewhere.

Since the regular `:hover` style most probably used so widely, the variant uses `@hover` syntax to distinguish it from the regular `hover` pseudo.

Example: `@hover-text-red`

Output:
```css
@media (hover: hover) and (pointer: fine) {
  .\@hover-text-red:hover {
    --un-text-opacity: 1;
    color: rgba(248, 113, 113, var(--un-text-opacity));
  }
}
```

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
