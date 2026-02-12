---
outline: deep
---

# Extracting

UnoCSS works by searching for utilities usage in your codebase and generating the corresponding CSS on-demand. We call this process **extracting**.

## Content Sources

UnoCSS supports extracting utilities usages from multiple sources:

- [Pipeline](#extracting-from-build-tools-pipeline) - Extract right from your build tools pipeline
- [Filesystem](#extracting-from-filesystem) - Extract from your filesystem by reading and watching files
- [Inline](#extracting-from-inline-text) - Extract from inline plain text

Usages of utilities that come from different sources will be merged together and generate the final CSS.

### Extracting from Build Tools Pipeline

This is supported in the [Vite](/integrations/vite) and [Webpack](/integrations/webpack) integrations.

UnoCSS will read the content that goes through your build tools pipeline and extract the utilities usages from it. This is the most efficient and accurate way to extract, as we only extract the usages that are actually used in your app, smartly, with no additional file I/O made during the extraction.

By default, UnoCSS will extract the utilities usage from files in your build pipeline with extensions `.jsx`, `.tsx`, `.vue`, `.md`, `.html`, `.svelte`, `.astro`, `.marko`, and then generate the appropriate CSS on demand. `.js` and `.ts` files are **NOT included by default**.

To configure them, you can update your `uno.config.ts`:

```ts [uno.config.ts]
export default defineConfig({
  content: {
    pipeline: {
      include: [
        // the default
        /\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/,
        // include js/ts files
        'src/**/*.{js,ts}',
      ],
      // exclude files
      // exclude: []
    },
  },
})
```

You can also add `@unocss-include` magic comment, on a per-file basis, anywhere in the file that you want UnoCSS to scan. If you need to scan `*.js` or `*.ts` files, add them in the configuration to include all js/ts files as scan targets.

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

Similarly, you can also add `@unocss-ignore` to bypass the scanning and transforming for the whole file.

If you want the UnoCSS to skip a block of code without being extracted in any extracting files, you can use `@unocss-skip-start` and `@unocss-skip-end` in pairs. Note that it must be used **in pairs** to be effective.

```html
<p class="text-green text-xl">Green Large</p>

<!-- @unocss-skip-start -->
<!-- `text-red` will not be extracted -->
<p class="text-red">Red</p>
<!-- @unocss-skip-end -->
```

### Extracting from Filesystem

In cases that you are using integrations that do not have access to the build tools pipeline (for example, the [PostCSS](/integrations/postcss) plugin), or you are integrating with backend frameworks such that the code does not go through the pipeline, you can manually specify the files to be extracted.

```ts [uno.config.ts]
export default defineConfig({
  content: {
    filesystem: [
      'src/**/*.php',
      'public/*.html',
    ],
  },
})
```

The files matched will be read directly from the filesystem and watched for changes at dev mode.

### Extracting from Inline Text

Additionally, you can also extract utility usages from inline text that you might retrieve from elsewhere.

You may also pass an async function to return the content. But note that the function will only be called once at build time.

```ts [uno.config.ts]
export default defineConfig({
  content: {
    inline: [
      // plain text
      '<div class="p-4 text-red">Some text</div>',
      // async getter
      async () => {
        const response = await fetch('https://example.com')
        return response.text()
      },
    ],
  },
})
```

## Limitations

Since UnoCSS works **at build time**, it means that only statically presented utilities will be generated and shipped to your app. Utilities that are used dynamically or fetched from external resources at runtime might **NOT** be detected or applied.

### Safelist

Sometimes you might want to use dynamic concatenations like:

```html
<div class="p-${size}"></div>
<!-- this won't work! -->
```

Due to the fact that UnoCSS works in build time using static extraction, at compile time it can't possibly know all the combinations of the utilities then. For that, you can configure the `safelist` option.

```ts [uno.config.ts]
safelist: 'p-1 p-2 p-3 p-4'.split(' ')
```

The corresponding CSS will always be generated:

<!-- eslint-skip -->

```css
.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }
```

Or more flexible:

```ts [uno.config.ts]
safelist: [
  ...Array.from({ length: 4 }, (_, i) => `p-${i + 1}`),
]
```

If you are seeking a true dynamic generation at runtime, you may want to check out the [@unocss/runtime](/integrations/runtime) package.

### Static List Combinations

Another way to work around the limitation of dynamically constructed utilities is that you can use an object that lists all the combinations **statically**. For example, if you want to have this:

```html
<div class="text-${color} border-${color}"></div>
<!-- this won't work! -->
```

You can create an object that lists all the combinations (assuming you know any possible values of `color` you want to use)

```ts
// Since they are static, UnoCSS will be able to extract them at build time
const classes = {
  red: 'text-red border-red',
  green: 'text-green border-green',
  blue: 'text-blue border-blue',
}
```

And then use it in your template:

```html
<div class="${classes[color]}"></div>
```

### Blocklist

Similar to `safelist`, you can also configure `blocklist` to exclude some utilities from being generated. This is useful for preventing extraction false positives.

But the blocklist is far more powerful than a simple exclusion list. In large-scale projects with many contributors, UnoCSS's flexibility — where the same visual result can be achieved with multiple utility syntaxes — becomes a liability. Different developers might write `border`, `border-1`, or `b` for the same CSS output, resulting in duplicate rules in the generated stylesheet, inconsistent code during reviews, and a growing CSS bundle. The blocklist lets you **enforce a single canonical syntax** across the entire codebase by blocking verbose or non-standard alternatives and pointing developers to the preferred form. Combined with `@unocss/eslint-plugin`, it acts as an automated style guide that restricts utilities to design system tokens, enforces the shortest aliases, and prevents arbitrary values — keeping CSS output minimal and the codebase consistent at scale.

#### Matcher Types

The `blocklist` accepts three matcher types:

**String** — exact match:

```ts [uno.config.ts]
blocklist: [
  'p-1', // blocks p-1 exactly
  'tab', // blocks tab exactly
]
```

**RegExp** — pattern match (uses `.test()`):

```ts [uno.config.ts]
blocklist: [
  /^p-[2-4]$/,       // blocks p-2, p-3, p-4
  /^border$/,        // blocks "border" but not "border-2"
]
```

**Function** — custom logic, returns truthy to block:

```ts [uno.config.ts]
blocklist: [
  (s) => s.endsWith('px'),              // block all px-suffixed classes
  (s) => s.split('-').length > 4,       // block deeply nested utilities
]
```

#### Messages

Each matcher can optionally be wrapped in a tuple containing a `message` that explains why the utility is blocked. The message can be a static string or a callback that receives the matched selector:

```ts [uno.config.ts]
blocklist: [
  // static message
  [/^border$/, { message: 'use shorter "b"' }],

  // dynamic message — receives the blocked selector
  [/^border(?:-[btrlxy])?$/, {
    // e.g. "border-y" → 'use shorter "b-y"'
    message: (v) => `use shorter "${v.replace(/^border/, 'b')}"`
  }],
]
```

When used with `@unocss/eslint-plugin`, the message appears in lint output:

```
"border" is in blocklist: use shorter "b"
```

Without the ESLint plugin, blocked utilities are silently excluded from CSS generation with no feedback to the developer.
**It is recommended to use `@unocss/eslint-plugin` alongside blocklist rules** to surface actionable messages during development.

#### Variant Awareness

The blocklist checks selectors **both before and after variant stripping**.
A rule blocking `p-1` will also block `hover:p-1`, `md:p-1`, `dark:p-1`, etc.
You don't need to account for variant prefixes in your blocklist patterns.

#### Merging Behavior

Blocklist arrays from all presets and the user config are **merged** — they accumulate and never override each other.
A utility blocked by any preset or the user config will remain blocked.

#### Type Reference

```ts
type BlocklistValue = string | RegExp | ((selector: string) => boolean | null | undefined)
type BlocklistRule = BlocklistValue | [BlocklistValue, BlocklistMeta]

interface BlocklistMeta {
  /**
   * Custom message to show why this selector is blocked.
   */
  message?: string | ((selector: string) => string)
}
```

### Blocklist Patterns

Below are common patterns for using the blocklist effectively.

#### Enforcing Shorter Aliases

When UnoCSS supports multiple syntaxes for the same CSS output, you can block the verbose form and suggest the shorter one:

```ts [uno.config.ts]
blocklist: [
  // "border" → "b", "border-t" → "b-t"
  [/^border(?:-[btrlxy])?$/, {
    message: (v) => `use shorter "${v.replace(/^border/, 'b')}"`
  }],

  // "opacity-50" → "op-50"
  // "backdrop-opacity-50" → "backdrop-op-50"
  [/^(?:backdrop-)?opacity-(.+)$/, {
    message: (v) => `use shorter "${v.replace(/opacity-/, 'op-')}"`
  }],

  // "whitespace-nowrap" → "ws-nowrap"
  [/^whitespace-.+$/, {
    message: (v) => `use shorter "${v.replace(/^whitespace-/, 'ws-')}"`
  }],

  // simple static aliases work well for one-to-one replacements
  [/^flex-grow$/, { message: 'use shorter "grow"' }],
  [/^flex-shrink$/, { message: 'use shorter "shrink"' }],
  [/^inline-block$/, { message: 'use shorter "i-block"' }], // you can point to your custom shortcuts as well
]
```

#### Restricting to Design System Tokens

You can dynamically build blocklist patterns from your design system config to ensure only valid tokens are used.
Use a negative lookahead to permit valid values while blocking everything else:

```ts [uno.config.ts]
import { theme } from './my-design-system'

// Helper to join object keys into a regex alternation
const keys = (obj: Record<string, any>) => Object.keys(obj).join('|')

blocklist: [
  // Only allow font families defined in the design system
  [new RegExp(`^font-(?!(?:${keys(theme.fontFamily)}|\\$)$).+$`), {
    message: `use design system font families: ${Object.keys(theme.fontFamily).join(', ')}`
  }],

  // Only allow shadow values from the design system
  [new RegExp(`^shadow-(?!(?:${keys(theme.boxShadow)}|\\$)).+$`), {
    message: `only design system shadow values are allowed.`
  }],
]
```

::: tip
The `\\$` in the negative lookahead allows CSS variable references (e.g., `font-$myVar`) to pass through, since those are resolved at runtime and can't be statically validated.
:::

#### Converting Raw Units to Scale Values

If your project uses the UnoCSS default spacing scale (where 1 unit = 0.25rem = 4px), you can block raw `px` and `rem` values and suggest the scale equivalent:

```ts [uno.config.ts]
blocklist: [
  // "mt-16px" → "mt-4"
  // "p-[8px]" → "p-2"
  // "w-2rem" → "w-8"
  [/^.+-\[?[\d.]+(?:px|rem)\]?$/, {
    message: (s) => {
      // since message() only receives the matched selector string, not the regex
      // we have to match it again to extract capture groups from the blocklist matcher
      const m = s.match(/\[?(?<v>[\d.]+)(?<u>px|rem)\]?$/)!
      const { v, u } = m.groups!
      const scale = u === 'rem' ? +v * 4 : +v / 4
      return `use spacing scale value: ${s.slice(0, -m[0].length)}${scale}`
    }
  }],
]
```

#### Removing Unnecessary Brackets

UnoCSS arbitrary value brackets `[...]` are often unnecessary when the value is already valid without them:

```ts [uno.config.ts]
blocklist: [
  // "w-[50%]" → "w-50%"
  [/^(w|h|min-[wh]|max-[wh]|top|right|bottom|left)-\[\d+%\]$/, {
    message: (v) => {
      const value = v.match(/\[(\d+%)\]/)?.[1] || ''
      return `use shorter ${v.replace(/-\[\d+%\]/, `-${value}`)}`
    }
  }],

  // "outline-[#ff0000]" → "outline-#ff0000"
  [/^[a-z-]+-\[#[0-9a-fA-F]{3,6}\]$/, {
    message: (v) => `use shorter ${v.replace(/\[#/, '#').replace(/\]/, '')}`
  }],
]
```

#### Enforcing Conventions

Block patterns that violate project-specific architectural decisions:

```ts [uno.config.ts]
blocklist: [
  // Prevent redundant breakpoint — if "sm" equals 0, it's always active
  // in mobile-first responsive design and should not be specified
  [/^sm:/, {
    message: (v) => `sm: breakpoint is redundant, use "${v.replace(/^sm:/, '')}"`
  }],

  // Force separate utility classes instead of slash opacity notation.
  // Separate utilities have a higher chance of reuse than slashed combinations,
  // which helps reduce the resulting CSS bundle size
  // "bg-red-500/50" → "bg-red-500 bg-op-50"
  [/^(c|bg)-.+\/\d+$/, {
    message: 'use separate opacity class instead of slash notation (e.g., "bg-red bg-op-50").'
  }],

  // Decompose shorthands into reusable individual properties.
  // Same principle — separate utilities reduce CSS bundle size
  // "size-4" → "w-4 h-4"
  [/^size-(.+)$/, {
    message: (v) => {
      const size = v.match(/^size-(.+)$/)?.[1]
      return `use "w-${size} h-${size}" for independent control`
    }
  }],
]
```
