---
title: UnoCSS VS Code Extension
description: UnoCSS for VS Code.
---

# UnoCSS VS Code Extension

[Install in Marketplace](https://marketplace.visualstudio.com/items?itemName=antfu.unocss)

- Decoration and tooltip for matched utilities
- Auto loading configs
- Count of matched utilities

## Config

To get the best IDE experience, we recommend you to [use a separate `uno.config.ts` file](/guide/config-file) for configuring your UnoCSS.

The extension will try to find the UnoCSS configurations under your project. When there is no config found, the extension will be disabled. To work with monorepo, you need to change the `unocss.root` option in your `settings.json` to the directory that contains the config file.

```javascript
{
  "unocss.root": "packages/client"
}
```
