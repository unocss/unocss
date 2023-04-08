---
title: Layers
icon: ph:stack-bold
description: UnoCSS allows you to define the layers as you want.
---

# Layers

The order of CSS will affect their priorities. While we will [retain the order of rules](/config/rules#ordering), sometimes you may want to group some utilities to have more explicit control of their order.

## Usage

Unlike Tailwind, which offers 3 fixed layers (`base`, `components`, `utilities`), UnoCSS allows you to define the layers as you want. To set the layer, you can pass the metadata as the third item of your rules:

```ts
rules: [
  [/^m-(\d)$/, ([, d]) => ({ margin: `${d / 4}rem` }), { layer: 'utilities' }],
  // when you omit the layer, it will be `default`
  ['btn', { padding: '4px' }],
]
```

This will generate:

```css
/* layer: default */
.btn { padding: 4px; }
/* layer: utilities */
.m-2 { margin: 0.5rem; }
```

Layering also can be set on each preflight:

```ts
preflights: [
  {
    layer: 'my-layer',
    getCSS: async () => (await fetch('my-style.css')).text(),
  },
]
```

## Ordering

You can control the order of layers by:

<!--eslint-skip-->

```ts
layers: {
  components: -1,
  default: 1,
  utilities: 2,
  'my-layer': 3,
}
```

Layers without specified order will be sorted alphabetically.

When you want to have your custom CSS between layers, you can update your entry module:

```ts
// 'uno:[layer-name].css'
import 'uno:components.css'
// layers that are not 'components' and 'utilities' will fallback to here
import 'uno.css'
// your own CSS
import './my-custom.css'
// "utilities" layer will have the highest priority
import 'uno:utilities.css'
```
