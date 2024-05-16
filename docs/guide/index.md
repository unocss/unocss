---
title: Guide
description: Getting started with UnoCSS
---

# What is UnoCSS?

UnoCSS is the instant atomic CSS engine, that is designed to be flexible and extensible. The core is un-opinionated and all the CSS utilities are provided via presets.

For example, you could define your custom CSS utilities, by providing rules in your local [config file](/guide/config-file).

```ts
// uno.config.ts
import { defineConfig } from 'unocss'

export default defineConfig({
  rules: [
    ['m-1', { margin: '1px' }],
  ],
})
```

This will add a new CSS utility `m-1` to your project. Since UnoCSS is on-demand, it won't do anything until you use it in your codebase. So say we have a component like this:

```html
<div class="m-1">Hello</div>
```

`m-1` will be detected and the following CSS will be generated:

```css
.m-1 { margin: 1px; }
```

To make it more flexible, you can make your rule dynamic by changing the first argument on the rule (we call it matcher) to a `RegExp`, and the body to a function, for example:

```diff
// uno.config.ts
export default defineConfig({
  rules: [
-    ['m-1', { margin: '1px' }],
+    [/^m-([\.\d]+)$/, ([_, num]) => ({ margin: `${num}px` })],
  ],
})
```

By doing this, now you can have arbitrary margin utilities, like `m-1`, `m-100` or `m-52.43`. And again, UnoCSS only generates them whenever you use them.

```html
<div class="m-1">Hello</div>
<div class="m-7.5">World</div>
```

```css
.m-1 { margin: 1px; }
.m-7.5 { margin: 7.5px; }
```

## Presets

Once you made a few rules, you can extract them into a preset, and share it with others. For example, you can create a preset for your company's design system, and share it with your team.

```ts
// my-preset.ts
import { Preset } from 'unocss'

export const myPreset: Preset = {
  name: 'my-preset',
  rules: [
    [/^m-([.\d]+)$/, ([_, num]) => ({ margin: `${num}px` })],
    [/^p-([.\d]+)$/, ([_, num]) => ({ padding: `${num}px` })],
  ],
  variants: [/* ... */],
  shortcuts: [/* ... */],
  // ...
}
```

```ts
// uno.config.ts
import { defineConfig } from 'unocss'
import { myPreset } from './my-preset'

export default defineConfig({
  presets: [
    myPreset, // your own preset
  ],
})
```

So similarly, we provided a few [official presets](/presets/) for you to start using right away, and you can also find many interesting [community presets](/presets/community).

## Play

You can try UnoCSS in your browser, in the <a href="/play/" target="_blank">Playground</a>. Or look up utilities from the default presets in the <a href="/interactive/" target="_blank">Interactive Docs</a>.

## Integrations

UnoCSS comes with integrations for various frameworks / tools:

<ContentIntegrations />

## Examples

Source code for all the examples can be found in the [/examples](https://github.com/unocss/unocss/tree/main/examples) directory.

<ContentExamples/>
