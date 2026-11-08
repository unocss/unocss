---
title: Build themes transformer
description: Build-time themes that remove unused theme classes from HTML as well as CSS (@unocss/transformer-build-themes)
outline: deep
---

# Build themes transformer

<!-- @unocss-ignore -->

Build-time themes for white-label products: one codebase, one build per customer. Each build keeps the classes of its active theme and removes every other theme's classes from the source, before HTML and CSS are compiled.

## HTML tree-shaking

Runtime themes (CSS variables, `dark:`, `[data-theme]`) switch in the browser, so every build ships every theme. Purging unused CSS does not help here: PurgeCSS, Tailwind's content scanning and UnoCSS's own extraction decide which CSS gets generated, but a class written for another theme stays in the markup as a dead token on every element.

This transformer runs on the source, before your framework compiles templates. A class that belongs to an inactive theme is removed from the HTML, from class strings in the client JS, and from the generated CSS together.

Use runtime themes when users switch themes in the browser. Use this transformer when the theme is fixed per build.

## Installation

::: code-group

```bash [pnpm]
pnpm add -D @unocss/transformer-build-themes
```

```bash [yarn]
yarn add -D @unocss/transformer-build-themes
```

```bash [npm]
npm install -D @unocss/transformer-build-themes
```

```bash [bun]
bun add -D @unocss/transformer-build-themes
```

:::

```ts [uno.config.ts]
import transformerBuildThemes from '@unocss/transformer-build-themes'
import { defineConfig } from 'unocss'

export default defineConfig({
  // ...
  transformers: [
    transformerBuildThemes({
      facets: { client: ['acme', 'globex'] },
      active: { client: process.env.CLIENT ?? 'acme' },
    }),
  ],
})
```

::: tip
This transformer is included in the `unocss` package, you can also import it from there:

```ts
import { transformerBuildThemes } from 'unocss'
```

:::

## Usage

Prefix a class with a facet value, the same way you would with a variant:

```html
<button class="px-4 py-2 acme:(bg-red c-white) globex:(bg-blue rounded-full)" />
```

With `acme` active, the build sees:

```html
<button class="px-4 py-2 bg-red c-white" />
```

With `globex` active:

```html
<button class="px-4 py-2 bg-blue rounded-full" />
```

### Theme facets

A theme is described by one or more facets: independent aspects such as the client, the product edition, the region or a seasonal campaign. Each facet lists its values, and a build picks one value per facet. The facet names are yours to choose.

Facets multiply: adding a facet with two values doubles the themes you can build, without touching the classes you already have.

```ts
transformerBuildThemes({
  facets: {
    client: ['acme', 'globex'],
    edition: ['standard', 'premium'],
  },
  active: { client: 'acme', edition: 'premium' },
})
```

A class is kept only when every facet value on it is active:

| Source                                    | Output with `acme` + `premium` active |
| ----------------------------------------- | ------------------------------------- |
| `acme:c-red`                              | `c-red`                               |
| `globex:c-blue`                           | _(removed)_                           |
| `acme:premium:bg-black`                   | `bg-black`                            |
| `acme:standard:bg-white`                  | _(removed)_                           |
| `hover:acme:c-red`                        | `hover:c-red`                         |
| `!globex:c-red`, `globex:(c-red bg-blue)` | _(removed)_                           |

Facet values can appear anywhere in the variant chain, and work with [variant groups](/transformers/variant-group), `!important`, arbitrary values and [`@apply`](/transformers/directives):

```css
.btn {
  @apply px-4 acme:bg-red globex:bg-blue;
}
```

An `@apply` statement or an `--at-apply` declaration whose classes all belong to inactive values is removed whole, so no empty `@apply;` reaches the CSS.

### Attributify

With [attributify mode](/presets/attributify), facet values go where variants go, in the value or in the attribute name:

```html
<div text="acme:red-300 globex:blue" />
<div acme:text="red-300" globex:premium:text="hover:blue-200" />
<div acme:c-red-300 globex:c-blue />
```

With `acme` + `premium` active, the build sees:

```html
<div text="red-300" />
<div text="red-300" />
<div c-red-300 />
```

An attribute with an inactive value in its name is removed with its value. An attribute whose value loses all its classes is removed when attributify would read the empty attribute as a utility, as `border=""` is `border`. Any other emptied attribute stays as `name=""`, so a component prop keeps an empty value instead of falling back to its default.

A facet value on its own is not an attribute name: attributify reads `acme="c-red"` as `acme-c-red`. To theme several utilities at once, group them in a class: `class="acme:(c-red-300 hover:c-blue)"`.

See the [`vite-build-themes` example](https://github.com/unocss/unocss/tree/main/examples/vite-build-themes) for a page with two facets, three clients and two editions, and a script comparing its build sizes with runtime themes.

### Transformer order

The transformer expands variant groups that contain a facet value itself, so it gives the same result before or after `transformerVariantGroup`. It must run before the transformers that read classes, so that they only see the active theme:

```ts [uno.config.ts]
export default defineConfig({
  transformers: [
    transformerVariantGroup(),
    transformerBuildThemes(options), // before the three below
    transformerAttributifyJsx(),
    transformerCompileClass(),
    transformerDirectives(),
  ],
})
```

`transformerDirectives` runs after it by default. If one of these comes first in the same `enforce` stage, the transformer throws an error naming it.

## Options

### facets

- **Type:** `Record<string, string[]>`
- **Required**

The theme facets, each listing its values. Values are the class prefixes: they must start with a letter, contain only letters, digits, `-` and `_`, and be unique across facets.

### active

- **Type:** `Record<string, string>`
- **Required**

The active value of every facet. The transformer reads no environment variables: resolve the active values in your config, for example from `process.env` in a CI build matrix.

## Editor and ESLint support

The transformer runs in your build, but editor tooling such as the [VS Code extension](/integrations/vscode) and the [ESLint plugin](/integrations/eslint) only read your config. Add `variantBuildThemes` to `variants` so they recognize facet values in source:

```ts [uno.config.ts]
import transformerBuildThemes, { variantBuildThemes } from '@unocss/transformer-build-themes'
import { defineConfig } from 'unocss'

const options = {
  facets: { client: ['acme', 'globex'] },
  active: { client: process.env.CLIENT ?? 'acme' },
}

export default defineConfig({
  variants: [
    ...variantBuildThemes(options),
  ],
  transformers: [
    transformerBuildThemes(options),
  ],
})
```

`variantBuildThemes` registers every facet value as a no-op variant. In a build, the prefixes are already gone by the time CSS is generated.

It also keeps class order stable. The [`unocss/order`](/integrations/eslint#rules) rule sorts facet values like any other variant, so themed classes come after unprefixed ones. The helper registers every facet value whatever `active` is, so the order is the same for every build. Without it, themed classes are unknown to the sorter and stay at the front, in source order.

::: warning
UnoCSS also extracts classes from files it does not transform, such as files outside [`pipeline.include`](/config/#content) or listed in `content.filesystem`. Facet values in those files stay, and with `variantBuildThemes` registered they generate CSS for every theme. Keep themed classes in transformed files.
:::

## Name collisions

A facet value must not match a variant your config already has. A value called `dark` would otherwise strip the real `dark:` variant from every class. The transformer checks this the first time it runs and throws an error naming the colliding variant.

## Caveats

- A kept class is a plain class with no extra specificity. With runtime themes, `premium:acme:c-blue` wins over `acme:c-red` because its selector is more specific. With build themes, both become `c-blue c-red` and CSS order decides. Write combinations that exclude each other instead:

  ```html
  <!-- acme + premium may render red -->
  <h1 class="acme:c-red premium:acme:c-blue" />
  <!-- always correct -->
  <h1 class="acme:(standard:c-red premium:c-blue)" />
  ```

- Only class names written in source are rewritten. A class assembled at runtime, such as `` `${client}:c-red` ``, is not.
- Facet values use the `:` separator. `acme-c-red` is not a themed class.
- The transformer rewrites class-like tokens anywhere in the files UnoCSS transforms: class attributes, strings in code, `@apply`, and text. Formatted code such as `{ acme: true }`, `cond ? acme : globex`, URLs and escaped CSS selectors (`.acme\:c-red`) are left alone, but an unformatted `{acme:true}`, or text such as `acme:value`, would be read as a class. For the same reason, do not use a CSS property name as a facet value (`color:red`).
- Svelte `class:` directives (`class:acme:c-red={on}`) and dynamic bindings such as Vue `:acme:text="color"` are not rewritten: use class names for themed styles there.
- Removing a class inside a Vue `:class` object leaves an empty key, for example `{ '': isActive }`. Vue ignores it.

## License

- MIT License &copy; 2026-PRESENT [Andrii Bohdanov](https://github.com/AndrewBogdanovTSS)
