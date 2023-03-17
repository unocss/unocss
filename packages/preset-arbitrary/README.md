# @unocss/preset-arbitrary

Support arbitrary variants for utilities.

## Installation

```bash
npm i -D @unocss/preset-arbitrary
```

```ts
import presetUno from '@unocss/preset-uno'
import presetArbitrary from '@unocss/preset-arbitrary'

UnoCSS({
  presets: [
    presetUno(),
    presetArbitrary()
  ],
})
```

## Usage

Support arbitrary variants with brackets:

```html
<div class="[&>*]:m-1 [&[open]]:p-2"></div>
```

Will generate:

```css
/* unescaped for demostraction */

.[&>*]:m-1 > * {
  margin: 0.25rem;
}
.[&[open]]:p-2[open] {
  padding: 0.5rem;
}
```

## License

MIT License &copy; 2022-PRESENT [Anthony Fu](https://github.com/antfu)
