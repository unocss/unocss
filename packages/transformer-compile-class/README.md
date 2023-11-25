# @unocss/transformer-compile-class

<!-- @unocss-ignore -->

Compile group of classes into one class. Inspired by [WindiCSS's compilation mode](https://windicss.org/posts/modes.html#compilation-mode) and [#948](https://github.com/unocss/unocss/issues/948) by [@UltraCakeBakery](https://github.com/UltraCakeBakery).

## Install

```bash
npm i -D @unocss/transformer-compile-class
```

```ts
// uno.config.ts
import { defineConfig } from 'unocss'
import transformerCompileClass from '@unocss/transformer-compile-class'

export default defineConfig({
  // ...
  transformers: [
    transformerCompileClass(),
  ],
})
```

## Usage

At the begin of your class strings, **add `:uno:` at the begin of the strings** to mark them for compilation. For example:

```html
<div class=":uno: text-center sm:text-left">
  <div class=":uno: text-sm font-bold hover:text-red"/>
</div>
```

Will be compiled to:

```html
<div class="uno-qlmcrp">
  <div class="uno-0qw2gr"/>
</div>
```

```css
.uno-qlmcrp {
  text-align: center;
}
.uno-0qw2gr {
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 700;
}
.uno-0qw2gr:hover {
  --un-text-opacity: 1;
  color: rgb(248 113 113 / var(--un-text-opacity));
}
@media (min-width: 640px) {
  .uno-qlmcrp {
    text-align: left;
  }
}
```

## Options

You can config the trigger string and prefix for compile class with the options. Refers to [the types](https://github.com/unocss/unocss/blob/main/packages/transformer-compile-class/src/index.ts#L4) for details.

## License

MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
