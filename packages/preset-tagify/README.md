# @unocss/preset-tagify

Tagify Mode for [UnoCSS](https://github.com/unocss/unocss).

## Installation

```bash
npm i -D @unocss/preset-tagify
```

```ts
import presetTagify from '@unocss/preset-tagify'

Unocss({
  presets: [
    presetTagify({ /* options */ }),
    // ...other presets
  ],
})
```

## Tagify Mode

This preset can come in handy when you only need a single unocss rule to be apply on an element.

```html
<span class="text-red"> red text </span>
<div class="flex"> flexbox </div>
I'm feeling <span class="i-line-md-emoji-grin"></span> today!
```

With tagify mode, you can embed CSS styles into HTML tags:

```html
<text-red> red text </text-red>
<flex> flexbox </flex>
I'm feeling <i-line-md-emoji-grin /> today!
```

The HTML above works exactly as you would expect.

## With Prefix

```js
presetTagify({
  prefix: 'un-'
})
```

```html
<!-- this will be matched -->
<un-flex> </un-flex>
<!-- this will not be matched -->
<flex> </flex>
```

## Extra Properties

You can inject extra properties to the matched rules:

```js
presetTagify({
  // adds display: inline-block to matched icons
  extraProperties: matched => matched.startsWith('i-')
    ? { display: 'inline-block' }
    : { }
})
presetTagify({
  // extraProperties can also be a plain object
  extraProperties: { display: 'block' }
})
```

## License

MIT License &copy; 2022-PRESENT [Jeff Zou](https://github.com/zojize)
MIT License &copy; 2022-PRESENT [Anthony Fu](https://github.com/antfu)
