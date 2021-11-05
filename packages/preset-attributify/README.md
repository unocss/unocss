# @unocss/preset-attributify

Attributify Mode for [UnoCSS](https://github.com/antfu/unocss).

## Installation

```bash
npm i -D @unocss/preset-attributify
```

```ts
import presetAttributify from '@unocss/preset-attributify'

Unocss({
  presets: [
    presetAttributify({ /* options */ })
    // ...other presets
  ]
})
```

## Attributify Mode

This preset enabled [Windi CSS's Attributify Mode](https://windicss.org/posts/v30.html#attributify-mode) for **other presets**.

Imagine you have this button using Tailwind's utilities. When the list gets long, it becomes really hard to read and maintain.

```html
<button class="bg-blue-400 hover:bg-blue-500 text-sm text-white font-mono font-light py-2 px-4 rounded border-2 border-blue-200 dark:bg-blue-500 dark:hover:bg-blue-600">
  Button
</button>
```

With attributify mode, you can separate utilities into attributes:

```html
<button 
  bg="blue-400 hover:blue-500 dark:blue-500 dark:hover:blue-600"
  text="sm white"
  font="mono light"
  p="y-2 x-4"
  border="2 rounded blue-200"
>
  Button
</button>
```

For example, `text-sm text-white` could be grouped into `text="sm white"` without duplicating the same prefix.

###### Valueless Attributify

In addition to Windi CSS's Attributify Mode, this presets also supports valueless attributes.

For example, 

```html
<div class="m-2 rounded text-teal-400" />
```

now can be

```html
<div m-2 rounded text-teal-400 />
```

## Credits

Initial idea by [@Tahul](https://github.com/Tahul) and [@antfu](https://github.com/antfu). Pior implementation in Windi CSS by [@voorjaar](https://github.com/voorjaar).

## License

MIT License © 2021-PRESENT [Anthony Fu](https://github.com/antfu)
