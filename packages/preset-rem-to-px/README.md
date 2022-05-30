# @unocss/preset-rem-to-px

Coverts rem to px for utils.

## Installation

```bash
npm i -D @unocss/preset-rem-to-px
```

```ts
import presetUno from '@unocss/preset-uno'
import presetRemToPx from '@unocss/preset-rem-to-px'

Unocss({
  presets: [
    presetUno(),
    presetRemToPx()
  ],
})
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
