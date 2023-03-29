---
title: UnoCSS VS Code Extension
description: UnoCSS for VS Code.
---

# UnoCSS VS Code Extension

- Decoration and tooltip for matched utilities
- Auto loading configs
- Count of matched utilities

<a href="https://marketplace.visualstudio.com/items?itemName=antfu.unocss" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/antfu.unocss.svg?color=eee&amp;label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>

## Config

// TODO: rewrite this section refering to the config file docs

By default the extension will search for the config files under project root:

- `uno.config.ts`
- `uno.config.ts`
- `vite.config.js`
- `svelte.config.js`
- `astro.config.js`
- `iles.config.js`
- `nuxt.config.js` (or `.ts`)

When there is no config found, the extension will be disabled. To work with monorepo, you need to change the `unocss.root` option in your `settings.json` to the directory that contains the config file.

```javascript
{
  "unocss.root": "packages/client"
}
```

## Nuxt

For now, it’s not working with auto-importing `defineNuxtConfig` in `nuxt.config.ts`. You must add import explicitly: 

```ts
import { defineNuxtConfig } from 'nuxt/config'
```

## License

- MIT License &copy; 2021-PRESENT [Anthony Fu](https://github.com/antfu)
