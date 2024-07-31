---
title: Rules
description: Writing custom rules for UnoCSS is super easy.
---

# Rules

Rules define utility classes and the resulting CSS. UnoCSS has many built-in rules but also allows for easily adding custom rules.

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

> **Note**: The body syntax follows CSS property syntax, eg. `font-weight` instead of `fontWeight`. If there is a hyphen `-` in the property name it should be quoted.
>
> ```ts
> rules: [
>   ['font-bold', { 'font-weight': 700 }],
> ]
> ```

## Dynamic rules

To make it smarter, change the matcher to a `RegExp` and the body to a function:

```ts
rules: [
  [/^m-(\d+)$/, ([, d]) => ({ margin: `${d / 4}rem` })],
  [/^p-(\d+)$/, match => ({ padding: `${match[1] / 4}rem` })],
]
```

The first argument of the body function is the `RegExp` match result that can be destructured to get the matched groups.

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

Congratulations! Now you've got your own powerful atomic CSS utilities. Enjoy!

## Ordering

UnoCSS respects the order of the rules you defined in the generated CSS. Latter ones come with higher priority.

When using dynamic rules, it may match multiple tokens. By default, the output of those matched under a single dynamic rule will be sorted alphabetically within the group.

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

## Special symbols

Since v0.61, UnoCSS supports special symbols to define additional meta information for your generated CSS. You can access symbols from the second argument of the dynamic rule matcher function.

For example:

```ts
rules: [
  [/^grid$/, ([, d], { symbols }) => {
    return {
      [symbols.parent]: '@supports (display: grid)',
      display: 'grid',
    }
  }],
]
```

Will generate:

```css
@supports (display: grid) {
  .grid {
    display: grid;
  }
}
```

### Available symbols

- `symbols.parent`: The parent wrapper of the generated CSS rule (eg. `@supports`, `@media`, etc.)
- `symbols.selector`: A function to modify the selector of the generated CSS rule (see the example below)
- `symbols.variants`: An array of variant handler that are applied to the current CSS object
- `symbols.shortcutsNoMerge`: A boolean to disable the merging of the current rule in shortcuts

## Multi-selector rules

Since v0.61, UnoCSS supports multi-selector via [JavaScript Generator functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator).

For example:

```ts
rules: [
  [/^button-(.*)$/, function* ([, color], { symbols }) {
    yield {
      background: color
    }
    yield {
      [symbols.selector]: selector => `${selector}:hover`,
      // https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix
      background: `color-mix(in srgb, ${color} 90%, black)`
    }
  }],
]
```

Will generate multiple CSS rules:

```css
.button-red {
  background: red;
}
.button-red:hover {
  background: color-mix(in srgb, red 90%, black);
}
```

## Fully controlled rules

::: tip
This is an advanced feature, in most situtations it won't be needed.
:::

When you really need some advanced rules that aren't covered by the combination of [Dynamic Rules](#dynamic-rules) and [Variants](/config/variants), UnoCSS also provides a way to give you full control to generate the CSS.

It allows you to return a string from the dynamic rule's body function which will be **directly** passed to the generated CSS (this also means you need to take care of things like CSS escaping, variant applying, CSS constructing, and so on).

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
