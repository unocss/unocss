---
title: Typography preset
description: Typography classes for UnoCSS (@unocss/preset-typography).
outline: deep
---

# Typography preset

Provides a set of prose classes you can use to add typographic defaults to vanilla HTML.

[Source Code](https://github.com/unocss/unocss/tree/main/packages-presets/preset-typography)

## Installation

::: code-group

```bash [pnpm]
pnpm add -D @unocss/preset-typography
```

```bash [yarn]
yarn add -D @unocss/preset-typography
```

```bash [npm]
npm install -D @unocss/preset-typography
```

```bash [bun]
bun add -D @unocss/preset-typography
```

:::

::: tip
This preset is included in the `unocss` package, you can also import it from there:

```ts
import presetTypography from 'unocss'
```

:::

## Usage

```ts [uno.config.ts]
import {
  defineConfig,
  presetAttributify,
  presetTypography,
  presetWind3 // or presetWind4
} from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(), // required!
    presetAttributify(), // required when using attributify mode
    presetTypography(),
  ],
})
```

::: code-group

```html [Classes]
<article class="text-base prose dark:prose-invert xl:text-xl">
  {{ markdown }}
  <p class="not-prose">Some text</p>
</article>
```

```html [Attributes]
<article text-base prose="~ dark:invert" xl="text-xl">
  {{ markdown }}
  <p class="not-prose">Some text</p>
</article>
```

:::

::: warning
Notice: `not-prose` can only be used as a class, not as an attribute.
:::

## Highlights

### Any size

Apply different typography sizes with built-in size variants: `prose-sm`, `prose-base`, `prose-lg`, `prose-xl`, and `prose-2xl`. The default `prose` class uses the base size, and you can override it with specific size utilities.

```html
<!-- Different sizes -->
<article class="prose prose-sm">Small typography</article>
<article class="prose prose-base">Base typography (default)</article>
<article class="prose prose-lg">Large typography</article>
<article class="prose prose-xl">Extra large typography</article>
<article class="prose prose-2xl">2X large typography</article>
```

You can also combine size utilities with responsive variants:

```html
<!-- Responsive typography sizes -->
<article class="prose prose-sm md:prose-base lg:prose-lg xl:prose-xl">
  Responsive typography that scales with screen size
</article>

<!-- Use with other utilities -->
<article class="prose prose-lg prose-gray dark:prose-invert">Large typography with color and dark mode</article>
```

### Any color

Apply any color with `prose-${colorName}` utilities provided by `presetWind3/4`. Their colors come from the theme's `colors` key, and it's recommended that these colors have a range from `50` to `950` for proper gradation. Therefore, `presetWind3/4` is **required**

And the default color for `prose` is `prose-gray`. The prose color utilities will apply to various typographic elements such as headings, links, blockquotes, and code blocks.

```html
<!-- Different color themes -->
<article class="prose prose-gray">Gray themed typography</article>
<article class="prose prose-blue">Blue themed typography</article>
<article class="prose prose-green">Green themed typography</article>
<article class="prose prose-purple">Purple themed typography</article>
```

| Natural Colors                                                                   | Accent Colors                                                    |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| These have different color scheduling ranges, affecting global typography usage. | These only change the link color and do not affect other colors. |
| `prose-slate`                                                                    | `prose-rose`                                                     |
| `prose-slate`                                                                    | `prose-red`                                                      |
| `prose-gray`                                                                     | `prose-orange`                                                   |
| `prose-zinc`                                                                     | `prose-amber`                                                    |
| `prose-neutral`                                                                  | `prose-yellow`                                                   |
| `prose-stone`                                                                    | `prose-lime`                                                     |
|                                                                                  | `prose-green`                                                    |
|                                                                                  | `prose-emerald`                                                  |
|                                                                                  | `prose-teal`                                                     |
|                                                                                  | `prose-cyan`                                                     |
|                                                                                  | `prose-sky`                                                      |
|                                                                                  | `prose-blue`                                                     |
|                                                                                  | `prose-indigo`                                                   |
|                                                                                  | `prose-violet`                                                   |
|                                                                                  | `prose-purple`                                                   |
|                                                                                  | `prose-fuchsia`                                                  |
|                                                                                  | `prose-pink`                                                     |
|                                                                                  | `prose-rose`                                                     |

You can combine colors with sizes and responsive variants:

```html
<!-- Responsive color changes -->
<article class="prose prose-gray md:prose-blue lg:prose-green">
  Typography that changes color at different breakpoints
</article>

<!-- Color with size and dark mode -->
<article class="prose prose-lg prose-slate dark:prose-invert">
  Large typography with slate color and dark mode support
</article>
```

### Dark mode with a single utility

Apply typographic dark mode with `prose-invert` (background color needs to be
handled by users). For instance, `prose dark:prose-invert` will use the
inverted colors in the dark mode.

### Your very own style

Styles of elements not within `prose` will stay the same. No style resetting
just like UnoCSS.

### Undo with `not` utility

Apply `not-prose` to the elements to undo the typographic styles. For
instance, `<table class="not-prose">` will skip the styles by this preset for
the `table` element **(NOTE: `not` utility is only usable in class since it is
only used in CSS** **selector & not scanned by UnoCSS)**.

### Compatibility options

This preset uses some pseudo-classes which are not widely supported, but you
can disable them. ([#2064](https://github.com/unocss/unocss/pull/2064))

- If you enable `noColonNot` or `noColonWhere`, `not-prose` will be unavailable.
- If you enable `noColonIs`, attributify mode will have a wrong behavior.

## Options

This preset provides comprehensive configuration options for customizing typography styles, colors, sizes, and behavior.

:::tip
The CSS declarations passed to `cssExtend` will

- **override** the built-in styles if the values are conflicting, else
- **be merged** deeply with built-in styles.
  :::

### selectorName

- **Type:** `string`
- **Default:** `prose`

The class name to use the typographic utilities. To undo the styles to the elements, use it like `not-${selectorName}` which is by default `not-prose`.

:::tip
`not` utility is only available in class.
:::

### cssExtend

- **Type:** `Record<string, CSSObject> | ((theme: T) => Record<string, CSSObject>)`
- **Default:** `undefined`

Extend or override CSS selectors with CSS declaration block. Can be either a static object or a function that receives the theme and returns CSS selectors.

### important

- **Type:** `boolean | string`
- **Default:** `false`

Control whether prose utilities should be marked with `!important`. When set to `true`, all prose styles will have `!important` added. When set to a string, it will be used as a CSS selector scope.

### colorScheme

- **Type:** `TypographyColorScheme`
- **Default:** See below

Color scheme for typography elements. Each key represents a typographic element with values in the format `[light, dark]` => `[color, invert-color]`.

**Default color scheme:**

```json
{
  "body": [700, 300],
  "headings": [900, "white"],
  "lead": [600, 400],
  "links": [900, "white"],
  "bold": [900, "white"],
  "counters": [500, 400],
  "bullets": [300, 600],
  "hr": [200, 700],
  "quotes": [900, 100],
  "quote-borders": [200, 700],
  "captions": [500, 400],
  "kbd": [900, "white"],
  "kbd-shadows": [900, "white"],
  "code": [900, "white"],
  "pre-code": [200, 300],
  "pre-bg": [800, "rgb(0 0 0 / 50%)"],
  "th-borders": [300, 600],
  "td-borders": [200, 700]
}
```

### sizeScheme

- **Type:** `TypographySizeScheme`
- **Default:** `undefined`

Size scheme for typography elements. Allows you to customize the CSS styles of various typographic elements for different sizes. Similar to `cssExtend`, but applies granular overlays to different text sizes.

**Example:**

```json
{
  "sm": {
    "h1": { "font-size": "1.5rem" },
    "p": { "font-size": "0.875rem" }
  },
  "base": {
    "h1": { "font-size": "2rem" },
    "p": { "font-size": "1rem" }
  },
  "lg": {
    "h1": { "font-size": "2.5rem" },
    "p": { "font-size": "1.125rem" }
  }
}
```

### cssVarPrefix

- **Type:** `string`
- **Default:** `--un-prose`

Prefix for generated CSS custom properties (CSS variables). This allows you to customize the naming of CSS variables used internally by the preset.

### compatibility

- **Type:** `TypographyCompatibilityOptions`
- **Default:** `undefined`

See [Compatibility options](#compatibility-options).
:::warning
Notice that it will affect some features.
:::

```ts
interface TypographyCompatibilityOptions {
  noColonWhere?: boolean
  noColonIs?: boolean
  noColonNot?: boolean
}
```

## Example

```ts [uno.config.ts]
import { presetTypography } from '@unocss/preset-typography'
import { defineConfig, presetAttributify, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [
    presetAttributify(), // required if using attributify mode
    presetWind3(), // required
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

- [Tailwind CSS Typography](https://github.com/tailwindlabs/tailwindcss-typography)
- [Windi CSS Typography](https://github.com/windicss/windicss/tree/main/src/plugin/typography)
