# @unocss/preset-typography

Typography Preset for UnoCSS

## Installation

```bash
pnpm add @unocss/preset-typography -D
```

## Usage

```js
// unocss.config.js
import { defineConfig, presetAttributify, presetTypography, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetAttributify(), // required if using attributify mode
    presetUno(), // required
    presetTypography(),
  ],
})
```

<table>
<thead>
<tr style="text-align: center">
<th>With classes</th>
<th>With attributes</th>
</tr>
</thead>
<tbody>
<tr>
<td>

<!-- prettier-ignore -->
```html
<article class="text-base prose prose-truegray xl:text-xl">
  {{ markdown }}
  <p class="not-prose">
    some text
  </p>
</article>
```

</td>

<td>

<!-- prettier-ignore -->
```html
<article text-base prose prose-truegray xl="text-xl">
  {{ markdown }}
  <p class="not-prose">
    not-prose is only available in class.
  </p>
</article>
```

</td>
</tr>
</tbody>
</table>

## Highlight

- **Any font size you want**

  Apply any font size for body you like and `prose` will scale the styles for
  the respective HTML elements. For instance, `prose text-lg` has body font size
  `1.125rem` and `h1` will with scale with that size 2.25 times. See [all the
  supported HTML elements].

  [all the supported html elements]: https://github.com/unocss/unocss/blob/main/packages/preset-typography/src/preflights/default.ts

- **Any color you like**

  Apply any color with `prose-${colorName}` by UnoCSS (e.g. `prose-coolgray`,
  `prose-sky`) since `prose` does not have any color by default. See
  [all available colors](#colors). For instance, `prose prose-truegray` will use
  the respective colors for the respective HTML elements.

- **Dark mode in ONE utility**

  Apply typographic dark mode with `prose-invert` (background color needs to be
  handled by users). For instance, `prose dark:prose-invert` will use the
  inverted colors in the dark mode.

- **Your own style, still your style**

  Styles of elements not within `prose` will stay the same. No style resetting
  just like UnoCSS.

- **Undo with `not` utility**

  Apply `not-prose` to the elements to undo the typographic styles. For
  instance, `<table class="not-prose">` will skip the styles by this preset for
  the `table` element **(NOTE: `not` utility is only usable in class since it is
  only used in CSS** **selector & not scanned by UnoCSS)**.

## Utilities

|  Rule   |                                            Styles by this rule                                                    |
| :-----: | :---------------------------------------------------------------------------------------------------------------: |
| `prose` | See [on GitHub](https://github.com/unocss/unocss/blob/main/packages/preset-typography/src/preflights/default.ts). |

### Colors

| Rules (color)   |
| --------------- |
| `prose-rose`    |
| `prose-pink`    |
| `prose-fuchsia` |
| `prose-purple`  |
| `prose-violet`  |
| `prose-indigo`  |
| `prose-blue`    |
| `prose-sky`     |
| `prose-cyan`    |
| `prose-teal`    |
| `prose-emerald` |
| `prose-green`   |
| `prose-lime`    |
| `prose-yellow`  |
| `prose-amber`   |
| `prose-orange`  |
| `prose-red`     |
| `prose-gray`    |
| `prose-slate`   |
| `prose-zinc`    |
| `prose-neutral` |
| `prose-stone`   |

## Configurations

This preset has `selectorName` and `cssExtend` configurations for users who like
to override or extend.

The CSS declarations passed to `cssExtend` will

- **override** the built-in styles if the values are conflicting, else

- **be merged** deeply with built-in styles.

### Type of `TypographyOptions`

```ts
export interface TypographyOptions {
  /**
   * The class name to use the typographic utilities.
   * To undo the styles to the elements, use it like
   * `not-${selectorName}` which is by default `not-prose`.
   *
   * Note: `not` utility is only available in class.
   *
   * @defaultValue `prose`
   */
  selectorName?: string

  /**
   * Extend or override CSS selectors with CSS declaration block.
   *
   * @defaultValue undefined
   */
  cssExtend?: Record<string, CSSObject>
}
```

### Example

```ts
// unocss.config.ts
import { defineConfig, presetAttributify, presetUno } from 'unocss'
import { presetTypography } from '@unocss/preset-typography'

export default defineConfig({
  presets: [
    presetAttributify(), // required if using attributify mode
    presetUno(), // required
    presetTypography({
      selectorName: 'markdown', // now use like `markdown markdown-gray`, `not-markdown`
      // cssExtend is an object with CSS selector as key and
      // CSS declaration block as value like writing normal CSS.
      cssExtend: {
        'code': {
          color: '#8b5cf6',
        },
        'a:hover': {
          color: '#f43f5e',
        },
        'a:visited': {
          color: '#14b8a6',
        },
      },
    }),
  ],
})
```

## Acknowledgement

- [TailwindCSS Typography](https://github.com/tailwindlabs/tailwindcss-typography)
- [WindiCSS Typography](https://github.com/windicss/windicss/tree/main/src/plugin/typography)

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)

MIT License &copy; 2021-PRESENT [Jeff Yang](https://github.com/ydcjeff)
