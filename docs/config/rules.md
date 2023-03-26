---
title: Rules
description: Writing custom rules for UnoCSS is super easy.
---

# Rules

Rules define the way UnoCSS search and generate CSS for your codebase.

## Static rules

With this example:

```ts
rules: [
  ['m-1', { margin: '0.25rem' }],
]
```

The following CSS will be generated whenever `m-1` is detected in users' codebase:

```css
.m-1 { margin: 0.25rem; }
```

## Dynamic rules

To make it smarter, change the matcher to a RegExp and the body to a function:

```ts
rules: [
  [/^m-(\d+)$/, ([, d]) => ({ margin: `${d / 4}rem` })],
  [/^p-(\d+)$/, match => ({ padding: `${match[1] / 4}rem` })],
]
```

The first argument of the body function is the match result, you can destructure it to get the matched groups.

For example, with the following usage:

```html
<div class="m-100">
  <button class="m-3">
    <icon class="p-5" />
    My Button
  </button>
</div>
```

the corresponding CSS will be generated:

```css
.m-100 { margin: 25rem; }
.m-3 { margin: 0.75rem; }
.p-5 { padding: 1.25rem; }
```

Congratulations! Now you got your own powerful atomic CSS utilities, enjoy!

## Full controlled rules

::: warning
This is an advanced feature, you don't need it in most of the cases.
:::

When you really need some advanced rules that can't be covered by the combination of [Dynamic Rules](#dynamic-rules) and [Variants](#custom-variants), we also provide a way to give you full control to generate the CSS.

By returning a `string` from the dynamic rule's body function, it will be directly passed to the generated CSS. That also means you would need to take care of things like CSS escaping, variants applying, CSS constructing, and so on.

```ts
// uno.config.ts
import { defineConfig, toEscapedSelector as e } from 'unocss'

export default defineConfig({
  rules: [
    [/^custom-(.+)$/, ([, name], { rawSelector, currentSelector, variantHandlers, theme }) => {
      // discard mismatched rules
      if (name.includes('something'))
        return

      // if you want, you can disable the variants for this rule
      if (variantHandlers.length)
        return
      const selector = e(rawSelector)
      // return a string instead of an object
      return `
${selector} {
  font-size: ${theme.fontSize.sm};
}
/* you can have multiple rules */
${selector}::after {
  content: 'after';
}
.foo > ${selector} {
  color: red;
}
/* or media queries */
@media (min-width: ${theme.breakpoints.sm}) {
  ${selector} {
    font-size: ${theme.fontSize.sm};
  }
}
`
    }],
  ],
})
```

You might need to read some code to take the full power of it.

## Ordering

UnoCSS respects the order of the rules you defined in the generated CSS. Latter ones come with higher priority.

## Rules merging

By default, UnoCSS will merge CSS rules with the same body to minimize the CSS size.

For example, `<div class="m-2 hover:m2">` will generate:

```css
.hover\:m2:hover, .m-2 { margin: 0.5rem; }
```

Instead of two separate rules:

```css
.hover\:m2:hover { margin: 0.5rem; }
.m-2 { margin: 0.5rem; }
```
