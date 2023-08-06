---
outline: deep
---

# Extracting

UnoCSS works by searching for the utilities usages from your codebase and generate the corresponding CSS on-demand. And we call this process **extracting**.

## Content Sources

UnoCSS supports extracting utilities usages from multiple sources:

- [Pipeline](#extracting-from-build-tools-pipeline) - Extract right from your build tools pipeline
- [Filesystem](#extracting-from-filesystem) - Extract from your filesystem by reading and watching files
- [Inline](#extracting-from-inline-text) - Extract from inline plain text

Usages of utilities that comes from different sources will be merged together and generate the final CSS.


### Extracting from Build Tools Pipeline

This is supported in the [Vite](/integrations/vite) and [Webpack](/integrations/webpack) integrations.

UnoCSS will read the content that goes through your build tools pipeline and extract the utilities usages from them. This is the most efficient and accurate way to extract as we only extract the usages that are actually used in your app smartly, and no additional file IO is made during the extraction.

By default, UnoCSS will extract the utilities usage from files in your build pipeline with extension `.jsx`, `.tsx`, `.vue`, `.md`, `.html`, `.svelte`, `.astro` and then generate the appropriate CSS on demand. `.js` and `.ts` files are **NOT included by default**.

To configure them, you can update your `uno.config.ts`:

```ts
// uno.config.ts
export default defineConfig({
  content: {
    pipeline: {
      include: [
        // the default
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        // include js/ts files
        'src/**/*.{js,ts}',
      ],
      // exclude files
      // exclude: []
    }
  }
})
```

You can also add `@unocss-include` magic comment, per-file basis, anywhere in the file that you want UnoCSS to scan, or add `*.js` or `*.ts` in the configuration to include all js/ts files as scan targets.

```ts
// ./some-utils.js

// since `.js` files are not included by default,
// the following comment tells UnoCSS to force scan this file.
// @unocss-include
export const classes = {
  active: 'bg-primary text-white',
  inactive: 'bg-gray-200 text-gray-500',
}
```

Similarly, you can also add `@unocss-ignore` to bypass the scanning and transforming for a file.

If you want the UnoCSS to skip a block of code without being extracted, you can use `@unocss-skip-start` `@unocss-skip-end` in pairs:

```html
<p class="text-green text-xl">
  Green Large
</p>

<!-- @unocss-skip-start -->
<!-- `text-red` will not be extracted -->
<p class="text-red">
  Red
</p>
<!-- @unocss-skip-end -->
```

:::tip
You can use `@unocss-skip-start` `@unocss-skip-end` magic comment in any extracting files, and must be used **in pairs** to be effective.
:::

### Extracting from Filesystem

In cases that you are using integrations that does not have access to the build tools pipeline (for example, the [PostCSS](/integrations/postcss) plugin), or you are integrating with backend frameworks that the code does not go through the pipeline, you can manually specify the files to be extracted.

```ts
// uno.config.ts
export default defineConfig({
  content: {
    filesystem: [
      'src/**/*.php',
      'public/*.html',
    ]
  }
})
```

The files matched will be read directly from the filesystem and watched for changes at dev mode.

### Extracting from Inline Text

Additionally, you can also extract utilities usages from inline text, that you might retrieve from else where.

You may also pass an async function to return the content. But note that the function will only be called once at the build time.

```ts
// uno.config.ts
export default defineConfig({
  content: {
    inline: [
      // plain text
      '<div class="p-4 text-red">Some text</div>',
      // async getter
      async () => {
        const response = await fetch('https://example.com')
        return response.text()
      }
    ]
  }
})
```

## Limitations

Since UnoCSS works **at build time**, it means that only statically presented utilities will be generated and shipped to your app. Utilities that are used dynamically or fetched from external resources at runtime might **NOT** be applied.

### Safelist

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

### Blocklist

Similar to `safelist`, you can also configure `blocklist` to exclude some utilities from being generated. Different from `safelist`, `blocklist` accept both string for exact match and regex for pattern match.

```ts
// uno.config.ts
blocklist: [
  'p-1',
  /^p-[2-4]$/,
]
```

This will exclude `p-1` and `p-2`, `p-3`, `p-4` from being generated. Useful to exclude some false positives.


