---
title: Next.js
description: Getting started with UnoCSS and Next.js.
---

# Next.js

Getting Started with UnoCSS and Next.js. Check the [example](https://github.com/unocss/unocss/tree/main/examples/next).

There are two setups, depending on your bundler:

| Setup                                       | Use it for                           | Transformers |
| ------------------------------------------- | ------------------------------------ | ------------ |
| [Turbopack](#turbopack) with `@unocss/next` | Next.js 16 or newer                  | Supported    |
| [PostCSS](#postcss) with `@unocss/postcss`  | Next.js 15 and older, or `--webpack` | Unsupported  |

## Turbopack

For Next.js 16 or newer.

### Installation

::: code-group

```bash [pnpm]
pnpm add -D unocss @unocss/next
```

```bash [yarn]
yarn add -D unocss @unocss/next
```

```bash [npm]
npm install -D unocss @unocss/next
```

```bash [bun]
bun add -D unocss @unocss/next
```

:::

Add `withUnoCSS` to your Next.js config.

```ts [next.config.ts]
import type { NextConfig } from 'next'
import { withUnoCSS } from '@unocss/next'

const nextConfig: NextConfig = {
  // your Next.js config
}

export default withUnoCSS(nextConfig)
```

Create a `uno.config.ts` file:

```ts [uno.config.ts]
import { defineConfig } from 'unocss'

export default defineConfig({
  // ...UnoCSS options
})
```

### Content sources

The two halves of [`content`](/guide/extracting) split differently here than in Vite:

|                                                                              |                                                                                |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [`content.pipeline`](/guide/extracting#extracting-from-build-tools-pipeline) | selects which files Turbopack hands to the transformers                        |
| [`content.filesystem`](/guide/extracting#extracting-from-filesystem)         | selects which files are scanned for utilities, defaulting to the whole project |

Turbopack runs each loader in an isolated worker, so the loader that generates your CSS cannot see the utilities other loader runs found. It rediscovers them from disk instead, the same way [`@unocss/postcss`](/integrations/postcss) does — which is why `content.filesystem` is the extraction source here rather than the escape hatch it is elsewhere. Narrow it to speed up large projects:

```ts [uno.config.ts]
export default defineConfig({
  content: {
    filesystem: ['app/**/*.{tsx,jsx,md,mdx}'],
  },
})
```

`withUnoCSS` reads `content.pipeline` when Next.js loads its config, so editing it applies on the next dev server start.

### Import stylesheets

Add `@unocss;` to your global stylesheet. The generated CSS replaces the directive in place, so its position decides where it lands in the cascade.

```css [globals.css]
@unocss;

/* ... */
```

```tsx [layout.tsx]
import './globals.css'
```

The directive takes layer names, so the layer splitting shown in [Layer Ordering](/config/layers#ordering) works here. Within one stylesheet, a later bare `@unocss;` picks up whatever the earlier directives left:

```css [globals.css]
@unocss preflights;

/* your base styles */

@unocss; /* the remaining layers */
```

Across stylesheets there is one difference: a loader sees one file at a time, so a bare `@unocss;` cannot know which layers another file already emitted. Name them by hand:

```css
@unocss preflights; /* one file */
@unocss !preflights; /* another */
```

:::tip
If migrating from `@unocss/postcss`, add [`transformerDirectives`](/transformers/directives) to `uno.config.ts` to get
`@apply`, `@screen` and `theme()` working in your own stylesheets.
:::

## PostCSS

For Next.js 15 and older, or builds that still use webpack.

::: tip
Directives like`@apply`, `@screen` and `theme()` work automatically, but transformers like [`transformerVariantGroup`](/transformers/variant-group) and [`transformerCompileClass`](/transformers/compile-class) are not supported at all.
:::

### Installation

::: code-group

```bash [pnpm]
pnpm add -D unocss @unocss/postcss
```

```bash [yarn]
yarn add -D unocss @unocss/postcss
```

```bash [npm]
npm install -D unocss @unocss/postcss
```

```bash [bun]
bun add -D unocss @unocss/postcss
```

:::

Create `postcss.config.mjs` at the root of your project.

```js [postcss.config.mjs]
export default {
  plugins: {
    '@unocss/postcss': {
      content: ['./app/**/*.{html,js,ts,jsx,tsx}'],
    },
  },
}
```

Create a `uno.config.ts` file:

```ts [uno.config.ts]
import { defineConfig } from 'unocss'

export default defineConfig({
  // ...UnoCSS options
})
```

### Import stylesheets

Add `@unocss all;` in `globals.css`, then import it from your layout.

```css [globals.css]
@unocss all;

/* ... */
```

```tsx [layout.tsx]
import './globals.css'
```

## License

- MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
