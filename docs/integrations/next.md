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

### Import stylesheets

Add `@unocss` to your global stylesheet. It will be replaced by the generated CSS.

```css [globals.css]
@unocss;

/* ... */
```

```tsx [layout.tsx]
import './globals.css'
```

:::tip
If migrating from `@unocss/postcss`, add [`transformerDirectives`](/transformers/directives) to `uno.config.ts` to get
`@apply`, `@screen` and `theme()` working in your own stylesheets.
:::

### Advanced configuration

If you need to customize which files are scanned for classes, set `content.filesystem` in `uno.config.ts`. The default is very relaxed.

```ts [uno.config.ts]
export default defineConfig({
  content: {
    // Defaults to ['**/*.{html,js,ts,jsx,tsx,vue,svelte,astro,elm,php,phtml,mdx,md,marko}']
    filesystem: ['app/**/*.{html,js,ts,jsx,tsx,mdx,md}'],
  },
})
```

Unlike Vite based setups, `content.pipeline` is not used for extracting classes, but it can still control which files can be transformed by transformers.

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

Add `@unocss` in `globals.css`, then import it from your layout.

```css [globals.css]
@unocss;

/* ... */
```

```tsx [layout.tsx]
import './globals.css'
```

## License

- MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
