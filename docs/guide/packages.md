---
title: Packages
description: "UnoCSS Packages: available packages and what's included and enabled in unocss."
outline: deep
---

# Packages

UnoCSS is a monorepo that contains multiple packages. This page lists all the packages and what's included in `unocss` package:

| Package                                                              | Description                                       | Included in `unocss` | Enabled |
|----------------------------------------------------------------------|---------------------------------------------------|----------------------| ------- |
| [@unocss/core](/tools/core)                                          | The core library without preset                   | ✅ | - |
| [@unocss/cli](/integrations/cli)                                     | Command line interface for UnoCSS                 | ✅ | - |
| [@unocss/preset-uno](/presets/uno)                                   | The default preset                                | ✅ | ✅ |
| [@unocss/preset-mini](/presets/mini)                                 | The minimal but essential rules and variants      | ✅ | ✅ |
| [@unocss/preset-wind](/presets/wind)                                 | Tailwind CSS / Windi CSS compact preset           | ✅ | ✅ |
| [@unocss/preset-attributify](/presets/attributify)                   | Enables Attributify Mode for other rules          | ✅ | No |
| [@unocss/preset-tagify](/presets/tagify)                             | Enables Tagify Mode for other rules               | ✅ | No |
| [@unocss/preset-icons](/presets/icons)                               | Pure CSS Icons solution powered by Iconify        | ✅ | No |
| [@unocss/preset-web-fonts](/presets/web-fonts)                       | Web fonts (Google Fonts, etc.) support            | ✅ | No |
| [@unocss/preset-typography](/presets/typography)                     | The typography preset                             | ✅ | No |
| [@unocss/preset-rem-to-px](/presets/rem-to-px)                       | Coverts rem to px for utils                       | No | No |
| [@unocss/preset-legacy-compat](/presets/legacy-compat)               | Collections of legacy compatibility utilities     | No | No |
| [@unocss/transformer-variant-group](/transformers/variant-group)     | Transformer for Windi CSS's variant group feature | ✅ | No |
| [@unocss/transformer-directives](/transformers/directives)           | Transformer for CSS directives like `@apply`      | ✅ | No |
| [@unocss/transformer-compile-class](/transformers/compile-class)     | Compile group of classes into one class           | ✅ | No |
| [@unocss/transformer-attributify-jsx](/transformers/attributify-jsx) | Support valueless attributify in JSX/TSX          | ✅ | No |
| [@unocss/extractor-pug](/extractors/pug)                             | Extractor for Pug                                 | No | - |
| [@unocss/extractor-svelte](/extractors/svelte)                       | Extractor for Svelte                              | No | - |
| [@unocss/autocomplete](/tools/autocomplete)                          | Utils for autocomplete                            | No | - |
| [@unocss/config](/guide/config-file)                                 | Configuration file loader                         | ✅ | - |
| [@unocss/reset](/guide/style-reset)                                  | Collection of common CSS resets                   | ✅ | No |
| [@unocss/vite](/integrations/vite)                                   | The Vite plugins                                  | ✅ | - |
| [@unocss/inspector](/tools/inspector)                                | The inspector UI for UnoCSS                       | ✅ | - |
| [@unocss/astro](/integrations/astro)                                 | The Astro integration                             | ✅ | - |
| [@unocss/webpack](/integrations/webpack)                             | The Webpack plugin                                | No | - |
| [@unocss/nuxt](/integrations/nuxt)                                   | The Nuxt Module                                   | No | - |
| [@unocss/svelte-scoped](/integrations/svelte-scoped)                 | Svelte Scoped Vite plugin + Preprocessor          | No | - |
| [@unocss/next](/integrations/next)                                   | The Next.js plugin                                | No | - |
| [@unocss/runtime](/integrations/runtime)                             | CSS-in-JS Runtime for UnoCSS                      | No | - |
| [@unocss/eslint-plugin](/integrations/eslint)                        | ESLint plugin                                     | No | - |
| [@unocss/eslint-config](/integrations/eslint)                        | ESLint config                                     | No | - |
| [@unocss/postcss](/integrations/postcss)                             | The PostCSS plugin                                | No | - |
| [VS Code Extension](/integrations/vscode)                            | UnoCSS for VS Code                                | - | - |
