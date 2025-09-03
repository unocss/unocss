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
.m-1 {
  margin: 0.25rem;
}
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
  // You can get rich context information from the second argument, such as `theme`, `symbols`, etc.
  [/^p-(\d+)$/, (match, ctx) => ({ padding: `${match[1] / 4}rem` })],
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

<!-- eslint-skip -->

```css
.m-100 { margin: 25rem; }
.m-3 { margin: 0.75rem; }
.p-5 { padding: 1.25rem; }
```

Congratulations! Now you've got your own powerful atomic CSS utilities. Enjoy!

## CSS Rules Fallback

In cases you might want to leverage CSS rules fallback to use new CSS features while also able to fallback to support old browsers, you can optionally return a 2D-array as the CSS representation for rules with the same keys. For example:

```ts
rules: [
  [/^h-(\d+)dvh$/, ([_, d]) => {
    return [
      ['height', `${d}vh`],
      ['height', `${d}dvh`],
    ]
  }],
]
```

Which will make `h-100dvh` generates:

<!-- eslint-skip -->

```css
.h-100dvh { height: 100vh; height: 100dvh; }
```

## Special symbols

Since v0.61, UnoCSS supports special symbols to define additional meta information for your generated CSS. You can access the symbols from the `symbols` object from `@unocss/core` or the second argument of the dynamic rule matcher function.

For example:

::: code-group

```ts [Static Rules]
import { symbols } from '@unocss/core'

rules: [
  ['grid', {
    [symbols.parent]: '@supports (display: grid)',
    display: 'grid',
  }],
]
```

```ts [Dynamic Rules]
rules: [
  [/^grid$/, ([, d], { symbols }) => {
    return {
      [symbols.parent]: '@supports (display: grid)',
      display: 'grid',
    }
  }],
]
```

:::

Will generate:

```css
@supports (display: grid) {
  .grid {
    display: grid;
  }
}
```

:::tip
If you know exactly how a rule is generated, we recommend using **static rules** to improve UnoCSS performance.
:::

### Available symbols

| Symbols                    | Description                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `symbols.parent`           | The parent wrapper of the generated CSS rule (e.g., `@supports`, `@media`, etc.)                           |
| `symbols.selector`         | A function to modify the selector of the generated CSS rule (see example below)                            |
| `symbols.layer`            | Sets the UnoCSS layer of the generated CSS rule (can be string, function, or regex match)                  |
| `symbols.variants`         | An array of variant handlers applied to the current CSS object                                             |
| `symbols.shortcutsNoMerge` | Boolean to disable merging of the current rule in shortcuts                                                |
| `symbols.noMerge`          | Boolean to disable merging of the current rule                                                             |
| `symbols.sort`             | Number to overwrite sorting order of the current CSS object                                                |
| `symbols.body`             | Fully control the body of the generated CSS rule (see [#4889](https://github.com/unocss/unocss/pull/4889)) |

## Multi-selector rules

Since v0.61, UnoCSS supports multi-selector via [JavaScript Generator functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator). And generates _multiple_ CSS rules from a _single_ rule.

For example:

::: code-group

```ts [Static Rules]
rules: [
  ['button-red', [
    { background: 'red' },
    {
      [symbols.selector]: selector => `${selector}:hover`,
      // https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix
      background: `color-mix(in srgb, red 90%, black)`
    },
  ]],
]
```

```ts [Dynamic Rules]
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

:::

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

```ts [uno.config.ts]
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

::: warning
The above method can fully control the generated CSS, but it cannot be extended through `variants`, losing the flexibility brought by its variant.

e.g. `hover:custom-xxx` -> The `hover` variant won't work.
:::

So if you want to fully customize the output while still enjoying the convenience of variants, you can consider using `symbols.body` to achieve this.

::: code-group

```ts [Static Rules]
import { symbols } from '@unocss/core'

rules: [
  ['custom-red', {
    // symbols.body doesn't need `{}` wrapping the styles
    [symbols.body]: `
      font-size: 1rem;
      &::after {
        content: 'after';
      }
      & > .bar {
        color: red;
      }
    `,
    [symbols.selector]: selector => `:is(${selector})`,
  }]
]
```

```ts [Dynamic Rules]
rules: [
  [/^custom-(.+)$/, ([_, c], { symbols }) => {
    return {
      [symbols.body]: `
        font-size: 1rem;
        &::after {
          content: 'after';
        }
        & > .bar {
          color: ${c};
        }
      `,
      [symbols.selector]: selector => `:is(${selector})`,
    }
  }]
]
```

:::

Will generate fully CSS rules from `hover:custom-red`:

```css
:is(.hover\:custom-red):hover {
  font-size: 1rem;
  &::after {
    content: 'after';
  }
  & > .bar {
    color: red;
  }
}
```

## Ordering

UnoCSS respects the order of the rules you defined in the generated CSS. Latter ones come with higher priority.

When using dynamic rules, it may match multiple tokens. By default, the output of those matched under a single dynamic rule will be sorted alphabetically within the group.

## Rules merging

By default, UnoCSS will merge CSS rules with the same body to minimize the CSS size.

For example, `<div class="m-2 hover:m2">` will generate:

```css
.hover\:m2:hover,
.m-2 {
  margin: 0.5rem;
}
```

Instead of two separate rules:

```css
.hover\:m2:hover {
  margin: 0.5rem;
}
.m-2 {
  margin: 0.5rem;
}
```
