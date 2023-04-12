# Extracting

Since UnoCSS works **at build time**, it means that only statically presented utilities will be generated and shipped to your app. Utilities that are used dynamically or fetched from external resources at runtime might not be applied.

By default, UnoCSS will extract the utilities usage from files in your build pipeline with extension `.jsx`, `.tsx`, `.vue`, `.md`, `.html`, `.svelte`, `.astro` and then generate the appropriate CSS on demand.

`.js` and `.ts` files are **NOT included by default**.

You can add `@unocss-include`, per-file basis, anywhere in the file that you want UnoCSS to scan, or add `*.js` or `*.ts` in the configuration to include all js/ts files as scan targets.

```ts
// ./some-utils.js

// since `.js` files are not included by default, the following comment tells UnoCSS to force scan this file.
// @unocss-include
export const classes = {
  active: 'bg-primary text-white',
  inactive: 'bg-gray-200 text-gray-500',
}
```

Similarly, you can also add `@unocss-ignore` to bypass the scanning and transforming for a file.

## Safelist

Sometimes you might want to use dynamic concatenations like:

```html
<div class="p-${size}"></div> <!-- this won't work! -->
```

Due the fact that UnoCSS works in build time using static extracting, at the compile time we can't possibility know all the combination of the utilities. For that, you can configure the `safelist` option.

```ts
// uno.config.ts
safelist: 'p-1 p-2 p-3 p-4'.split(' ')
```

the corresponding CSS will always be generated:

```css
.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }
```

Or more flexible:

```ts
// uno.config.ts
safelist: [
  ...Array.from({ length: 4 }, (_, i) => `p-${i + 1}`),
]
```

If you are seeking for a true dynamic generation at runtime, you may want to check out the [@unocss/runtime](https://github.com/unocss/unocss/tree/main/packages/runtime) package.

## Blocklist

Similar to `safelist`, you can also configure `blocklist` to exclude some utilities from being generated. Different from `safelist`, `blocklist` accept both string for exact match and regex for pattern match.

```ts
// uno.config.ts
blocklist: [
  'p-1',
  /^p-[2-4]$/,
]
```

This will exclude `p-1` and `p-2`, `p-3`, `p-4` from being generated. Useful to exclude some false positives.


