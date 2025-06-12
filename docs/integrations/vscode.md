---
title: UnoCSS VS Code Extension
description: UnoCSS for VS Code.
---

# VS Code Extension

[Install in Marketplace](https://marketplace.visualstudio.com/items?itemName=antfu.unocss)

- Decoration and tooltip for matched utilities
- Auto loading configs
- Count of matched utilities

## Commands

<!-- commands -->

| Command                         | Title                                           |
| ------------------------------- | ----------------------------------------------- |
| `unocss.reload`                 | UnoCSS: Reload UnoCSS                           |
| `unocss.insert-skip-annotation` | UnoCSS: Insert `@unocss-skip` for the selection |

<!-- commands -->

## Configurations

<!-- configs -->

| Key                             | Description                                              | Type           | Default    |
| ------------------------------- | -------------------------------------------------------- | -------------- | ---------- |
| `unocss.disable`                | Disable the UnoCSS extension                             | `boolean`      | `false`    |
| `unocss.languageIds`            |                                                          | `array`        | ``         |
| `unocss.root`                   | Project root that contains the UnoCSS configuration file | `array,string` | ``         |
| `unocss.include`                | Directory of files to be detected                        | `array,string` | ``         |
| `unocss.exclude`                | Directory of files not to be detected                    | `array,string` | ``         |
| `unocss.underline`              | Enable/disable underline decoration for class names      | `boolean`      | `true`     |
| `unocss.colorPreview`           | Enable/disable color preview decorations                 | `boolean`      | `true`     |
| `unocss.colorPreviewRadius`     | Radius for color preview                                 | `string`       | `"50%"`    |
| `unocss.remToPxPreview`         | Enable/disable rem to px preview in hover                | `boolean`      | `true`     |
| `unocss.remToPxRatio`           | Ratio of rem to px                                       | `number`       | `16`       |
| `unocss.selectionStyle`         | Enable/disable selection style decorations               | `boolean`      | `true`     |
| `unocss.strictAnnotationMatch`  | Be strict about where to show annotations                | `boolean`      | `false`    |
| `unocss.autocomplete.matchType` | The matching type for autocomplete                       | `string`       | `"prefix"` |
| `unocss.autocomplete.strict`    | Be strict about where to show autocomplete               | `boolean`      | `false`    |
| `unocss.autocomplete.maxItems`  | The maximum number of items to show in autocomplete      | `number`       | `1000`     |

<!-- configs -->

## Config

To get the best IDE experience, we recommend you to [use a separate `uno.config.ts` file](/guide/config-file) for configuring your UnoCSS.

The extension will try to find the UnoCSS configurations under your project. When there is no config found, the extension will be disabled.

## Icons Preset

If you're using the [Icons Preset](/presets/icons), you can also install [Iconify IntelliSense](https://marketplace.visualstudio.com/items?itemName=antfu.iconify) to get inlay preview, auto-completion, and hover information for your icons.
