# @unocss/preset-icons

Use **any** icons with **Pure CSS** for [UnoCSS](https://github.com/antfu/unocss).

<blockquote align="center">
<p>💡 Recommend reading - <br><a href="https://antfu.me/posts/icons-in-pure-css"><strong>Icons in Pure CSS</strong></a><br></p>
</blockquote>

Follow the following conventions to use the icons

- `<prefix><collection>-<icon>`
- `<prefix><collection>:<icon>`

For examples:

```html
<!-- A basic anchor icon from Phosphor icons -->
<div class="i-ph-anchor-simple-thin" />
<!-- An orange alarm from Material Design Icons -->
<div class="i-mdi-alarm text-orange-400" />
<!-- A large Vue logo -->
<div class="i-logos-vue text-3xl" />
<!-- Sun in light mode, Moon in dark mode, from Carbon -->
<button class="i-carbon-sun dark:i-carbon-moon" />
<!-- Twemoji of laugh, turns to tear on hovering -->
<div class="i-twemoji-grinning-face-with-smiling-eyes hover:i-twemoji-face-with-tears-of-joy" />
```

<img src="https://user-images.githubusercontent.com/11247099/136709053-31b4db79-eddc-4dc6-aa2d-388086332630.gif" height="100"><br><sup>This is powered by pure CSS</sup>

## Install

```bash
npm i -D @unocss/preset-icons @iconify-json/[the-collection-you-want]
```

We use [Iconify](https://iconify.design) as our data source of icons. You need to install the corresponding iconset in `devDependencies` by following the `@iconify-json/*` pattern. For example, `@iconify-json/mdi` for [Material Design Icons](https://materialdesignicons.com/), `@iconify-json/tabler` for [Tabler](https://tabler-icons.io/). You can refer to [Icônes](https://icones.js.org/) or [Iconify](https://icon-sets.iconify.design/) for all the collections available.

```ts
import presetIcons from '@unocss/preset-icons'

Unocss({
  presets: [
    presetIcons({ /* options */ })
    // ...other presets
  ]
})
```

> 💡 You can also use this preset alone as a complement to your existing UI frameworks to have pure CSS icons!

## Configuration

Refer to the [type definition](https://github.com/antfu/unocss/blob/main/packages/preset-icons/src/index.ts#L8) for all configrations avaliable.

### Extra Properties

You can provide the extra CSS properties to control the default behavior of the icons. The following is an example of make icons inlined by default:

```ts
presetIcons({
  extraProperties: {
    'display': 'inline-block',
    'vertical-align': 'middle',
    // ...
  }
})
```

## Credits

This preset is inspired from [this issue](https://github.com/antfu/unplugin-icons/issues/88) created by [@husayt](https://github.com/husayt). Based on the work of [this PR](https://github.com/antfu/unplugin-icons/pull/90) by [@userquin](https://github.com/userquin).

## License

MIT License © 2021-PRESENT [Anthony Fu](https://github.com/antfu)
