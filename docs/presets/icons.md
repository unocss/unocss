---
title: Icons preset
description: Use any icon with Pure CSS for UnoCSS (@unocss/preset-icons).
outline: deep
---

<script setup>
const toggleDark = () => {
  document.querySelector('.VPSwitchAppearance')?.click()
}
</script>

# Icons preset

Use any icon with Pure CSS for UnoCSS.

[Source Code](https://github.com/unocss/unocss/tree/main/packages/preset-icons)

::: tip
Recommended reading: [Icons in Pure CSS](https://antfu.me/posts/icons-in-pure-css)
:::

Follow the following conventions to use the icons

- `<prefix><collection>-<icon>`
- `<prefix><collection>:<icon>`

For example:

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

<div class="w-full flex items-center justify-center gap-x-4 text-4xl p-2 mt-4">
  <div class="i-ph:anchor-simple-thin" />
  <div class="i-mdi:alarm text-orange-400 hover:text-teal-400" />
  <div class="w-2em h-2em i-logos:vue transform transition-800 hover:rotate-180" />
  <button class="i-carbon:sun dark:i-carbon:moon !w-2em !h-2em" @click="toggleDark()" title="toggle dark mode"/>
  <div class="i-twemoji:grinning-face-with-smiling-eyes hover:i-twemoji:face-with-tears-of-joy" />
  <div class="text-base my-auto flex"><div class="i-carbon:arrow-left my-auto mr-1" /> Hover it</div>
</div>

Check [all available icons](https://icones.js.org/).

## Install

::: code-group
  ```bash [pnpm]
  pnpm add -D @unocss/preset-icons @iconify-json/[the-collection-you-want]
  ```
  ```bash [yarn]
  yarn add -D @unocss/preset-icons @iconify-json/[the-collection-you-want]
  ```
  ```bash [npm]
  npm install -D @unocss/preset-icons @iconify-json/[the-collection-you-want]
  ```
:::

We use [Iconify](https://iconify.design) as our data source of icons. You need to install the corresponding icon-set in `devDependencies` by following the `@iconify-json/*` pattern. For example, `@iconify-json/mdi` for [Material Design Icons](https://materialdesignicons.com/), `@iconify-json/tabler` for [Tabler](https://tabler-icons.io/). You can refer to [Icônes](https://icones.js.org/) or [Iconify](https://icon-sets.iconify.design/) for all the collections available.

```ts
// uno.config.ts
import { defineConfig } from 'unocss'
import presetIcons from '@unocss/preset-icons'

export default defineConfig({
  presets: [
    presetIcons({ /* options */ }),
    // ...other presets
  ],
})
```

::: tip
This preset is included in the `unocss` package, you can also import it from there:

```ts
import { presetIcons } from 'unocss'
```
:::

::: info
You can also use this preset alone as a complement to your existing UI frameworks to have pure CSS icons!
:::

If you prefer to install all the icon sets available on Iconify at once (~130MB):

::: code-group
  ```bash [pnpm]
  pnpm add -D @iconify/json
  ```
  ```bash [yarn]
  yarn add -D @iconify/json
  ```
  ```bash [npm]
  npm install -D @iconify/json
  ```
:::

### Extra Properties

You can provide the extra CSS properties to control the default behavior of the icons. The following is an example of making icons inlined by default:

```ts
presetIcons({
  extraProperties: {
    'display': 'inline-block',
    'vertical-align': 'middle',
    // ...
  },
})
```

## Modes Overriding

By default, this preset will choose the rendering modes automatically for each icon based on the icons' characteristics. You can read more in this [blog post](https://antfu.me/posts/icons-in-pure-css). In some cases, you may want to explicitly set the rendering modes for each icon.

- `?bg` for `background-img` - renders the icon as a background image
- `?mask` for `mask` - renders the icon as a mask image

For example, `vscode-icons:file-type-light-pnpm`, an icon with colors (the `svg` doesn't contain `currentColor`) that will be rendered as a background image. Use `vscode-icons:file-type-light-pnpm?mask` to render it as a mask image and bypass it's colors.

```html
<div class="w-full flex items-center justify-center gap-x-4 text-4xl p-2 mt-4">
  <div class="i-vscode-icons:file-type-light-pnpm" />
  <div class="i-vscode-icons:file-type-light-pnpm?mask text-red-300" />
</div>
```

<div class="w-full flex items-center justify-center gap-x-4 text-4xl p-2 mt-4">
  <div class="i-vscode-icons:file-type-light-pnpm" />
  <div class="i-vscode-icons:file-type-light-pnpm?mask text-red-300" />
</div>

## Configuring collections and icons resolvers

You can provide collections via `@iconify-json/[the-collection-you-want]`, `@iconify/json` or using your custom ones using `collections` option on your `UnoCSS` configuration.

### Browser

To load `iconify` collections you should use `@iconify-json/[the-collection-you-want]` and not `@iconify/json` since the `json` file is huge.

#### Bundler

When using bundlers, you can provide the collections using `dynamic imports` so they will be bundler as async chunk and loaded on demand.

```ts
import presetIcons from '@unocss/preset-icons/browser'

export default defineConfig({
  presets: [
    presetIcons({
      collections: {
        carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
        mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
        logos: () => import('@iconify-json/logos/icons.json').then(i => i.default),
      }
    })
  ]
})
```

#### CDN

Or if you prefer to fetch them from CDN, you can specify the `cdn` option since `v0.32.10`. We recommend [esm.sh](https://esm.sh/) as the CDN provider.

```ts
presetIcons({
  cdn: 'https://esm.sh/'
})
```

#### Customization

You can also provide your own custom collections using [CustomIconLoader](https://github.com/iconify/iconify/blob/master/packages/utils/src/loader/types.ts#L17) or [InlineCollection](https://github.com/iconify/iconify/blob/master/packages/utils/src/loader/types.ts#L86), for example using `InlineCollection`:

```ts
presetIcons({
  collections: {
    custom: {
      circle: '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50"></circle></svg>',
      /* ... */
    },
    carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default as any),
    /* ... */
  }
})
```

And then, you can use it on your html: `<span class="i-custom:circle"></span>`

### Node.js

In `Node.js` the preset will search for the installed iconify dataset automatically, so you don't need to register the `iconify` collections.

You can also provide your own custom collections using also [CustomIconLoader](https://github.com/iconify/iconify/blob/master/packages/utils/src/loader/types.ts#L24) or [InlineCollection](https://github.com/iconify/iconify/blob/master/packages/utils/src/loader/types.ts#L100).

#### FileSystemIconLoader

Additionally, you can also use [FileSystemIconLoader](https://github.com/iconify/iconify/blob/master/packages/utils/src/loader/node-loaders.ts#L9) to load your custom icons from your file system. You will need to install `@iconify/utils` package as `dev dependency`.

```ts
// uno.config.ts
import fs from 'node:fs/promises'
import { defineConfig, presetIcons } from 'unocss'

// loader helpers
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'

export default defineConfig({
  presets: [
    presetIcons({
      collections: {
        // key as the collection name
        'my-icons': {
          account: '<svg><!-- ... --></svg>',
          // load your custom icon lazily
          settings: () => fs.readFile('./path/to/my-icon.svg', 'utf-8'),
          /* ... */
        },
        'my-other-icons': async (iconName) => {
          // your custom loader here. Do whatever you want.
          // for example, fetch from a remote server:
          return await fetch(`https://example.com/icons/${iconName}.svg`).then(res => res.text())
        },
        // a helper to load icons from the file system
        // files under `./assets/icons` with `.svg` extension will be loaded as it's file name
        // you can also provide a transform callback to change each icon (optional)
        'my-yet-other-icons': FileSystemIconLoader(
          './assets/icons',
          svg => svg.replace(/#fff/, 'currentColor')
        )
      }
    })
  ]
})
```

#### ExternalPackageIconLoader

From `@iconify/utils v2.1.20` you can use other packages to load icons from others authors using the new [createExternalPackageIconLoader](https://github.com/iconify/iconify/blob/main/packages/utils/src/loader/external-pkg.ts#L13) helper.

::: warning WARNING
External packages must include `icons.json` file with the `icons` data in `IconifyJSON` format, which can be exported with Iconify Tools. Check [Exporting icon set as JSON package](https://iconify.design/docs/libraries/tools/export/json-package.html) for more details.
:::

For example, you can use `an-awesome-collection` or `@my-awesome-collections/some-collection` to load your custom or third party icons:
```ts
// uno.config.ts
import { defineConfig, presetIcons } from 'unocss'
import { createExternalPackageIconLoader } from '@iconify/utils/lib/loader/external-pkg'

export default defineConfig({
  presets: [
    presetIcons({
      collections: createExternalPackageIconLoader('an-awesome-collection')
    })
  ]
})
```

You can also combine it with other custom icon loaders, for example:
```ts
// uno.config.ts
import { defineConfig, presetIcons } from 'unocss'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import { createExternalPackageIconLoader } from '@iconify/utils/lib/loader/external-pkg'

export default defineConfig({
  presets: [
    presetIcons({
      collections: {
        ...createExternalPackageIconLoader('other-awesome-collection'),
        ...createExternalPackageIconLoader('@my-awesome-collections/some-collection'),
        ...createExternalPackageIconLoader('@my-awesome-collections/some-other-collection'),
        'my-yet-other-icons': FileSystemIconLoader(
          './assets/icons',
          svg => svg.replace(/^<svg /, '<svg fill="currentColor" ')
        )
      }
    })
  ]
})
```

## Icon Customizations

You can customize all icons using `customizations` configuration option.

Available customizations functions:

- `transform`: transform raw `svg`, will be only applied when using `custom` icon collection (`iconify` collections excluded).
- `customize`: change default icon customizations values.
- `iconCustomizer`: change default icon customizations values.

For each loaded icon, the customizations will be applied in this order:

- apply `transform` to raw `svg`, if provided and using custom icon collection
- apply `customize` with default customizations, if provided
- apply `iconCustomizer` with `customize` customizations, if provided

### Global Custom Icon Transformation

When loading your custom icons, you can transform them, for example adding `fill` attribute with `currentColor`:

```ts
presetIcons({
  customizations: {
    transform(svg) {
      return svg.replace(/#fff/, 'currentColor')
    }
  }
})
```

From version `0.30.8` the `transform` provides the `collection` and `icon` names:

```ts
presetIcons({
  customizations: {
    transform(svg, collection, icon) {
      // do not apply fill to this icons on this collection
      if (collection === 'custom' && icon === 'my-icon')
        return svg
      return svg.replace(/#fff/, 'currentColor')
    }
  }
})
```

### Global Icon Customization

When loading any icon you can customize common properties to all of them, for example configuring the same size:

```ts
presetIcons({
  customizations: {
    customize(props) {
      props.width = '2em'
      props.height = '2em'
      return props
    }
  }
})
```

### Icon/Collection Customization

You can customize each icon using `iconCustomizer` configuration option.

The `iconCustomizer` will take precedence over configuration.

The `iconCustomizer` will be applied to any collection, that is, for each icon from `custom` loader, `inlined` on `custom collections` or from `@iconify`.

For example, you can configure `iconCustomizer` to change all icons for a collection or individual icons on a collection:

```ts
presetIcons({
  customizations: {
    iconCustomizer(collection, icon, props) {
      // customize all icons in this collection
      if (collection === 'my-other-icons') {
        props.width = '4em'
        props.height = '4em'
      }
      // customize this icon in this collection
      if (collection === 'my-icons' && icon === 'account') {
        props.width = '6em'
        props.height = '6em'
      }
      // customize this @iconify icon in this collection
      if (collection === 'mdi' && icon === 'account') {
        props.width = '2em'
        props.height = '2em'
      }
    }
  }
})
```

## Options

### scale

- Type: `number`
- Default: `1`

Scale related to the current font size (1em).

### mode

- Type: `'mask' | 'background-img' | 'auto'`
- Default: `'auto'`
- See: https://antfu.me/posts/icons-in-pure-css

Mode of generated CSS icons.

:::tip
- `mask` - use background color and the `mask` property for monochrome icons
- `background-img` - use background image for the icons, colors are static
- `auto` - smartly decide mode between `mask` and `background-img` per icon based on its style
:::

### prefix

- Type: `string | string[]`
- Default: `'i-'`

Class prefix for matching icon rules.

### extraProperties

- Type: `Record<string, string>`
- Default: `{}`

Extra CSS properties applied to the generated CSS.

### warn

- Type: `boolean`
- Default: `false`

Emit warning when missing icons are matched.

### collections

- Type: `Record<string, (() => Awaitable<IconifyJSON>) | undefined | CustomIconLoader | InlineCollection>`
- Default: `undefined`

In Node.js environment, the preset will search for the installed iconify dataset automatically. When using in the browser, this options is provided to provide dataset with custom loading mechanism.

### layer

- Type: `string`
- Default: `'icons'`

Rule layer.

### customizations

- Type: `Omit<IconCustomizations, 'additionalProps' | 'trimCustomSvg'>`
- Default: `undefined`

Custom icon customizations.

### autoInstall

- Type: `boolean`
- Default: `false`

Auto install icon sources package when the usages is detected.

:::warning
Only on `node` environment, on `browser` this option will be ignored.
:::

### unit

- Type: `string`
- Default: `'em'`

Custom icon unit.

### cdn

- Type: `string`
- Default: `undefined`

Load icons from CDN. Should starts with `https://` and ends with `/`.

Recommends:

- `https://esm.sh/`
- `https://cdn.skypack.dev/`

### customFetch

- Type: `(url: string) => Promise<any>`
- Default: `undefined`

Preset used [`ofetch`](https://github.com/unjs/ofetch) as the default fetcher, you can also custom fetch function to provide the icon data.

### processor

- Type: `(cssObject: CSSObject, meta: Required<IconMeta>) => void`
- Default: `undefined`

```ts
interface IconMeta {
  collection: string
  icon: string
  svg: string
  mode?: IconsOptions['mode']
}
```

Processor for the CSS object before stringify. See [example](https://github.com/unocss/unocss/blob/7d83789b0dee8c72c401db24263ea429086de95d/test/preset-icons.test.ts#L66-L82).

## Advanced Custom Icon Set Cleanup

When using this preset with your custom icons, consider using a cleanup process similar to that done by [Iconify](https://iconify.design/) for any icons sets. All the tools you need are available in [Iconify Tools](https://iconify.design/docs/libraries/tools/).

You can check this repo, using this preset on a `Vue 3` project: [@iconify/tools/@iconify-demo/unocss](https://github.com/iconify/tools/tree/main/%40iconify-demo/unocss).

Read [Cleaning up icons](https://iconify.design/docs/articles/cleaning-up-icons/) article from [Iconify](https://iconify.design/) for more details.

## Credits

- This preset is inspired from [this issue](https://github.com/antfu/unplugin-icons/issues/88) created by [@husayt](https://github.com/husayt).
- Based on the work of [this PR](https://github.com/antfu/unplugin-icons/pull/90) by [@userquin](https://github.com/userquin).
