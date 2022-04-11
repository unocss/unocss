# @unocss/preset-scrollbar

Scrollbar Preset for UnoCSS. Allows unocss utility classes to be used on scrollbars using variants. This also adds rules to level 1 CSS scrollbar styling (for firefox compatibility).

## Installation

```bash
pnpm add @unocss/preset-scrollbar -D
```

## Usage

```js
// unocss.config.js
import { defineConfig, presetUno } from 'unocss'
import { presetScrollbar } from '@unocss/preset-scrollbar'

export default defineConfig({
  presets: [
    presetUno(), // required
    presetScrollbar(),
  ],
})
```

```html
<div class="overflow-auto
  scrollbar:w-2
  scrollbar:h-2
  scrollbar-thin
  scrollbar-thumb:rounded
  scrollbar-track:bg-gray-200
  scrollbar-thumb:bg-gray-400
  scrollbar-track-gray-200
  scrollbar-thumb-gray-400
  hover:scrollbar-thumb:bg-gray-600
  hover:scrollbar-thumb-gray-600">
</div>
```

Utility             | Webkit (Chrome)              | CSS Level 1 (Firefox)
------------------- | ---------------------------- | ---------------------
w-2                 | `scrollbar:w-2`              | `scrollbar-thin`
h-2                 | `scrollbar:h-2`              | `scrollbar-thin`
bg-{color} (thumb)  | `scrollbar-thumb:bg-{color}` | `scrollbar-thumb-{color}`
bg-{color} (track)  | `scrollbar-track:bg-{color}` | `scrollbar-track-{color}`
rounded   (thumb)   | `scrollbar-thumb:rounded`    | N/A
any unocss utility  | `scrollbar-{part}:{utility}`  | N/A

> Due to CSS limitations firefox can only adjust the thumb and track color and their widths.

## Variants

These variants allow adjustment of any scrollbar element in a webkit browser.

Variant                  | Element
------------------------ | -------------------
`scrollbar:`             | the whole scrollbar
`resizer:`               | resizer handle
`scrollbar-track:`       | scrollbar track
`scrollbar-track-piece:` | scrollbar track piece
`scrollbar-thumb:`       | scrollbar thumb
`scrollbar-corner:`      | scrollbar corner
`scrollbar-button:`      | scrollbar button

## Rules

The rules adjust scrollbars in CSS level 1 compliant browsers (firefox). They are severly limited compared to webkit's implementation.

Rule                      | Application
------------------------- | ---------------
`scrollbar-thin`          | scrollbar width
`scrollbar-none`          | scrollbar width
`scrollbar-auto`          | scrollbar width
`scrollbar-thumb-{color}` | unocss color applied to the thumb
`scrollbar-track-{color}` | unocss color applied to the track

## Cross Browser Shortcuts

Shortcut                     | Application
---------------------------- | -----------
`scrollbar-thin-all`         | `scrollbar:w-2 scrollbar:h-2 scrollbar-thin`
`scrollbar-bg-track-{color}` | `scrollbar-track:bg-{color} scrollbar-track-{color}`
`scrollbar-bg-thumb-{color}` | `scrollbar-thumb:bg-{color} scrollbar-thumb-{color}`