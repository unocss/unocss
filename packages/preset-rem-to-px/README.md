# @unocss/preset-rem-to-px

Coverts rem to px for utils.

## Installation

```bash
npm i -D @unocss/preset-rem-to-px
```

```ts
import presetUno from '@unocss/preset-uno'
import presetRemToPx from '@unocss/preset-rem-to-px'

UnoCSS({
  presets: [
    presetUno(),
    presetRemToPx()
  ],
})
```

## Nuxt 3 Installation

Step 1. Install @unocss/preset-rem-to-px

```bash
npm i -D @unocss/preset-rem-to-px
```

Step 2. Add the following references in the *__nuxt.config.ts__* file:

```ts
...
import presetUno from "@unocss/preset-uno";
import presetRemToPx from "@unocss/preset-rem-to-px";
import presetAttributify from "@unocss/preset-attributify";
import presetIcons from "@unocss/preset-icons";
...
```

Step 3. Add the *__unocss config__* in the *__nuxt.config.ts__* file:

```ts
export default defineNuxtConfig({
...
  unocss: {
    presets: [
      presetUno(),
      presetAttributify(),
      presetIcons(),
      presetRemToPx(),
    ],
    shortcuts: [],
    rules: [],
  },
...
});
```

## Usage

```html
<div class="m-2"></div>
```

<table><tr><td width="500px" valign="top">

### without

```css
.m-2 {
  margin: 0.5rem;
}
```

</td><td width="500px" valign="top">

### with

```css
.m-2 {
  margin: 8px;
}
```

</td></tr></table>

## License

MIT License &copy; 2022-PRESENT [Anthony Fu](https://github.com/antfu)
