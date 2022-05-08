# @unocss/transformer-compile-class

<!-- @unocss-ignore -->

Compile group of classes into one class. Inspried by [WindiCSS's compilation mode](https://windicss.org/posts/modes.html#compilation-mode) and [#948](https://github.com/unocss/unocss/issues/948) by [@UltraCakeBakery](https://github.com/UltraCakeBakery).

## Install

```bash
npm i -D @unocss/transformer-compile-class
```

```ts
import Unocss from 'unocss/vite'
import transformerCompileClass from '@unocss/transformer-compile-class'

Unocss({
  transformers: [
    transformerCompileClass(),
  ],
})
```

## Usage

At the begin of your class strings, add `:uno:` to mark it for compilation. For example:

```html
<div class=":uno: text-sm font-bold hover:text-red">
```

Will be compiled to:

```html
<div class="uno-0qw2gr">
```

```css
.uno-0qw2gr {
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 700;
}
.uno-0qw2gr:hover {
  --un-text-opacity: 1;
  color: rgba(248,113,113,var(--un-text-opacity));
}
```

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
