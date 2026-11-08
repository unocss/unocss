---
title: Build themes transformer
description: Build-time themes that remove unused theme classes from HTML as well as CSS (@unocss/transformer-build-themes)
outline: deep
---

# Build themes transformer

<!-- @unocss-ignore -->

Build-time themes for white-label products: one codebase, one build per customer. Each build keeps the classes of its active themes and removes every other theme's classes from the source, before HTML and CSS are compiled.

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
      themes: { client: ['acme', 'globex'] },
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

Prefix a class with a theme name, the same way you would with a variant:

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

### Theme groups

`themes` takes several independent groups, for example client × colour scheme. One theme per group is active, and a class is kept only when every theme prefix on it is active.

```ts
transformerBuildThemes({
  themes: {
    client: ['acme', 'globex'],
    scheme: ['day', 'night'],
  },
  active: { client: 'acme', scheme: 'night' },
})
```

| Source                                    | Output with `acme` + `night` active |
| ----------------------------------------- | ----------------------------------- |
| `acme:c-red`                              | `c-red`                             |
| `globex:c-blue`                           | _(removed)_                         |
| `acme:night:bg-black`                     | `bg-black`                          |
| `acme:day:bg-white`                       | _(removed)_                         |
| `hover:acme:c-red`                        | `hover:c-red`                       |
| `!globex:c-red`, `globex:(c-red bg-blue)` | _(removed)_                         |

Theme prefixes can appear anywhere in the variant chain, and work with [variant groups](/transformers/variant-group), `!important`, arbitrary values and [`@apply`](/transformers/directives):

```css
.btn {
  @apply px-4 acme:bg-red globex:bg-blue;
}
```

See the [`vite-build-themes` example](https://github.com/unocss/unocss/tree/main/examples/vite-build-themes) for a page with three clients and two colour schemes, and a script comparing its build sizes with runtime themes.

### Transformer order

The transformer expands variant groups that contain a theme itself, so it gives the same result before or after `transformerVariantGroup`. It must run before the transformers that read classes, so that they only see the active themes:

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

### themes

- **Type:** `Record<string, string[]>`
- **Required**

Theme names, grouped by axis. Names must start with a letter, contain only letters, digits, `-` and `_`, and be unique across groups.

### active

- **Type:** `Record<string, string>`
- **Required**

The active theme of every group in `themes`. The transformer reads no environment variables: resolve the active themes in your config, for example from `process.env` in a CI build matrix.

## Editor and ESLint support

The transformer runs in your build, but editor tooling such as the [VS Code extension](/integrations/vscode) and the [ESLint plugin](/integrations/eslint) only read your config. Add `variantBuildThemes` to `variants` so they recognize theme prefixes in source:

```ts [uno.config.ts]
import transformerBuildThemes, { variantBuildThemes } from '@unocss/transformer-build-themes'
import { defineConfig } from 'unocss'

const options = {
  themes: { client: ['acme', 'globex'] },
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

`variantBuildThemes` registers every theme name as a no-op variant. In a build, the prefixes are already gone by the time CSS is generated.

::: warning
UnoCSS also extracts classes from files it does not transform, such as files outside [`pipeline.include`](/config/#content) or listed in `content.filesystem`. Theme prefixes in those files stay, and with `variantBuildThemes` registered they generate CSS for every theme. Keep themed classes in transformed files.
:::

## Name collisions

A theme name must not match a variant your config already has. A theme called `dark` would otherwise strip the real `dark:` variant from every class. The transformer checks this the first time it runs and throws an error naming the colliding variant.

## Caveats

- A kept class is a plain class with no extra specificity. With runtime themes, `night:acme:c-blue` wins over `acme:c-red` because its selector is more specific. With build themes, both become `c-blue c-red` and CSS order decides. Write combinations that exclude each other instead:

  ```html
  <!-- acme + night may render red -->
  <h1 class="acme:c-red night:acme:c-blue" />
  <!-- always correct -->
  <h1 class="acme:(day:c-red night:c-blue)" />
  ```

- Only class names written in source are rewritten. A class assembled at runtime, such as `` `${theme}:c-red` ``, is not.
- Theme prefixes use the `:` separator. `acme-c-red` is not a themed class.
- The transformer rewrites class-like tokens anywhere in the files UnoCSS transforms: class attributes, strings in code, `@apply`, and text. Formatted code such as `{ acme: true }`, `cond ? acme : globex`, URLs and escaped CSS selectors (`.acme\:c-red`) are left alone, but an unformatted `{acme:true}`, or text such as `acme:value`, would be read as a class. For the same reason, do not name a theme after a CSS property (`color:red`).
- Valueless [attributify](/presets/attributify) attributes (`<div acme:c-red>`) are rewritten. Attributes with values (`acme:bg="red"`) and Svelte `class:` directives (`class:acme:c-red={on}`) are not: use class names for themed styles.
- Removing a class inside a Vue `:class` object leaves an empty key, for example `{ '': isActive }`. Vue ignores it.

## License

- MIT License &copy; 2026-PRESENT [Andrii Bohdanov](https://github.com/AndrewBogdanovTSS)
