---
title: Web fonts preset
description: Web fonts support for UnoCSS (@unocss/preset-web-fonts).
outline: deep
---

# Web Fonts preset

Use web fonts from [Google Fonts](https://fonts.google.com/), [FontShare](https://www.fontshare.com/) by simply providing the font names.

See [all supported providers](#providers).

[Source Code](https://github.com/unocss/unocss/tree/main/packages/preset-web-fonts)

## Installation

::: code-group
  ```bash [pnpm]
  pnpm add -D @unocss/preset-web-fonts
  ```
  ```bash [yarn]
  yarn add -D @unocss/preset-web-fonts
  ```
  ```bash [npm]
  npm install -D @unocss/preset-web-fonts
  ```
:::

```ts
// uno.config.ts
import { defineConfig } from 'unocss'
import presetWebFonts from '@unocss/preset-web-fonts'
import presetUno from '@unocss/preset-uno'

export default defineConfig({
  presets: [
    presetUno(),
    presetWebFonts({ /* options */ }),
  ],
})
```

::: tip
This preset is included in the `unocss` package, you can also import it from there:

```ts
import { presetWebFonts } from 'unocss'
```
:::

## Providers

Currently supported Providers:

- `none` - do nothing, treat the font as system font
- `google` - [Google Fonts](https://fonts.google.com/)
- `bunny` - [Privacy-Friendly Google Fonts](https://fonts.bunny.net/)
- `fontshare` - [Quality Font Service by ITF](https://www.fontshare.com/)

::: info
PR welcome to add more providers. 🙌
:::

### Custom fetch function

Use your own function to fetch font source.

```ts
// uno.config.ts
import { defineConfig } from 'unocss'
import presetWebFonts from '@unocss/preset-web-fonts'
import presetUno from '@unocss/preset-uno'
import axios from 'axios'
import ProxyAgent from 'proxy-agent'

export default defineConfig({
  presets: [
    presetUno(),
    presetWebFonts({
      // use axios with an https proxy
      customFetch: (url: string) => axios.get(url, { httpsAgent: new ProxyAgent('https://localhost:7890') }).then(it => it.data),
      provider: 'google',
      fonts: {
        sans: 'Roboto',
        mono: ['Fira Code', 'Fira Mono:400,700'],
      },
    }),
  ],
})
```

## Options

### provider
- **Type:** `WebFontsProviders`
- **Default:** `google`

Provider service of the web fonts.

```ts
type WebFontsProviders = 'google' | 'bunny' | 'fontshare' | 'none'
```

### fonts
- **Type:** `Record<string, WebFontMeta | string | (WebFontMeta | string)[]>`

The fonts. See [example](#example) for more details.

```ts
interface WebFontMeta {
  name: string
  weights?: (string | number)[]
  italic?: boolean
  /**
   * Override the provider
   * @default <matches root config>
   */
  provider?: WebFontsProviders
}
```

### extendTheme
- **Type:** `boolean`
- **Default:** `true`

Extend the theme object.

### themeKey
- **Type:** `string`
- **Default:** `fontFamily`

Key for the theme object.

### inlineImports
- **Type:** `boolean`
- **Default:** `true`

Inline CSS `@import()`.

### customFetch
- **Type:** `(url: string) => Promise<string>`
- **Default:** `undefined`

Use your own function to fetch font source. See [Custom fetch function](#custom-fetch-function).

## Example

```ts
presetWebFonts({
  provider: 'google', // default provider
  fonts: {
    // these will extend the default theme
    sans: 'Roboto',
    mono: ['Fira Code', 'Fira Mono:400,700'],
    // custom ones
    lobster: 'Lobster',
    lato: [
      {
        name: 'Lato',
        weights: ['400', '700'],
        italic: true,
      },
      {
        name: 'sans-serif',
        provider: 'none',
      },
    ],
  },
})
```

The following CSS will be generated automatically:

```css
@import url('https://fonts.googleapis.com/css2?family=Roboto&family=Fira+Code&family=Fira+Mono:wght@400;700&family=Lobster&family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap');

/* layer: default */
.font-lato {
  font-family: "Lato", sans-serif;
}
.font-lobster {
  font-family: "Lobster";
}
.font-mono {
  font-family: "Fira Code", "Fira Mono", ui-monospace, SFMono-Regular, Menlo,
    Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
.font-sans {
  font-family: "Roboto", ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans",
    sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol",
    "Noto Color Emoji";
}
```
